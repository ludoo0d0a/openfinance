import { flowById } from '@/data/flows';
import { paymentById } from '@/data/payments';
import type {
  LifeBeat,
  LifeOutcome,
  LifeScenario,
  LifeSceneId,
  LifeSceneMeta,
  LocalizedText,
} from '@/types';

const L = (en: string, fr: string): LocalizedText => ({ en, fr });

export const LIFE_SCENES: LifeSceneMeta[] = [
  {
    id: 'shop',
    brand: L('Atelier', 'Atelier'),
    title: L('Buy a t-shirt', 'Acheter un t-shirt'),
    blurb: L(
      'Checkout with pay-by-bank, instant, Wero, card, wallet — and what happens when it fails.',
      'Paiement en ligne : virement, instantané, Wero, carte, wallet — et les échecs.',
    ),
  },
  {
    id: 'stream',
    brand: L('Nox / Stall', 'Nox / Stall'),
    title: L('Subscribe or buy an app', 'S’abonner ou acheter une app'),
    blurb: L(
      'Direct debit for a streaming plan, or a one-shot in-app purchase.',
      'Prélèvement pour un abonnement, ou achat ponctuel dans une boutique d’apps.',
    ),
  },
  {
    id: 'wallet',
    brand: L('Pocket', 'Pocket'),
    title: L('Send money to a friend', 'Envoyer de l’argent à un ami'),
    blurb: L(
      'Phone or IBAN, VoP check, Wero or SCT Inst — plus wrong-person recall.',
      'Téléphone ou IBAN, VoP, Wero ou SCT Inst — et le rappel si mauvaise personne.',
    ),
  },
  {
    id: 'receive',
    brand: L('Pocket', 'Pocket'),
    title: L('Receive money from a friend', 'Recevoir de l’argent d’un ami'),
    blurb: L(
      'You are Marie: push, credit, statement — from the beneficiary side.',
      'Vous êtes Marie : notification, crédit, relevé — côté bénéficiaire.',
    ),
  },
  {
    id: 'bank',
    brand: L('Banque de Démonstration', 'Banque de Démonstration'),
    title: L('Bank inbox & internals', 'Banque : boîte & coulisses'),
    blurb: L(
      'Connect an app (AIS), cancel a pending payment, Swiss rails, SWIFT, hub routing.',
      'Connecter une app (AIS), annuler un paiement, rails suisses, SWIFT, hub.',
    ),
  },
];

/** Expand every step of a catalog flow into beats with consumer chrome lines. */
function flowBeats(
  flowId: string,
  lines: LocalizedText[],
  screens: string[],
): LifeBeat[] {
  const flow = flowById(flowId);
  if (!flow) throw new Error(`lifeScenes: unknown flow ${flowId}`);
  if (lines.length !== flow.steps.length || screens.length !== flow.steps.length) {
    throw new Error(
      `lifeScenes: ${flowId} expects ${flow.steps.length} lines/screens, got ${lines.length}/${screens.length}`,
    );
  }
  return flow.steps.map((step, i) => ({
    screen: screens[i]!,
    consumer: lines[i]!,
    flowId,
    step: step.n,
  }));
}

/** Expand selected payment hops into beats (no Flow for card/wallet/SDD/etc.). */
function hopBeats(
  paymentId: string,
  hopIds: string[],
  lines: LocalizedText[],
  screens: string[],
): LifeBeat[] {
  const payment = paymentById(paymentId);
  if (!payment) throw new Error(`lifeScenes: unknown payment ${paymentId}`);
  if (lines.length !== hopIds.length || screens.length !== hopIds.length) {
    throw new Error(`lifeScenes: hop list length mismatch for ${paymentId}`);
  }
  return hopIds.map((hopId, i) => {
    const hop = payment.hops.find((h) => h.id === hopId);
    if (!hop) throw new Error(`lifeScenes: unknown hop ${paymentId}/${hopId}`);
    return {
      screen: screens[i]!,
      consumer: lines[i]!,
      paymentId,
      hopId,
      sampleId: hop.sampleId,
      flowId: hop.flowId,
      step: hop.step,
    };
  });
}

function scenario(
  id: string,
  sceneId: LifeSceneId,
  title: LocalizedText,
  blurb: LocalizedText,
  outcome: LifeOutcome,
  beats: LifeBeat[],
  extra?: Partial<Pick<LifeScenario, 'paymentId' | 'pairScenarioId' | 'bankDeepLinkId'>>,
): LifeScenario {
  return { id, sceneId, title, blurb, outcome, beats, ...extra };
}

export const LIFE_SCENARIOS: LifeScenario[] = [
  // ── Atelier (shop) ────────────────────────────────────────────────────────
  scenario(
    'atelier-pisp-sct',
    'shop',
    L('Pay by bank (SEPA)', 'Payer par virement (SEPA)'),
    L('PISP creates the transfer, you approve in your bank, then clearing settles.', 'Le PISP crée le virement, vous validez à la banque, puis la compensation.'),
    'happy',
    [
      {
        screen: 'cart',
        consumer: L('Organic tee — €42.00', 'T-shirt bio — 42,00 €'),
      },
      {
        screen: 'method',
        consumer: L('Choose pay-by-bank', 'Choisir payer par virement'),
      },
      ...flowBeats(
        'bg-pis-sepa-redirect',
        [
          L('Checkout sends the payment request', 'Le panier envoie la demande de paiement'),
          L('Bank starts strong customer authentication', 'La banque démarre l’authentification forte'),
          L('You approve in the bank app', 'Vous validez dans l’app banque'),
          L('Redirect back to Atelier', 'Retour vers Atelier'),
          L('Shop polls payment status', 'La boutique interroge le statut'),
          L('Accepted — banks will clear overnight', 'Accepté — compensation le lendemain'),
        ],
        ['processing', 'sca', 'sca', 'processing', 'processing', 'processing'],
      ),
      ...flowBeats(
        'clearing-sct-happy-path',
        [
          L('Your bank files the customer credit', 'Votre banque dépose le pain.001'),
          L('pacs.008 leaves for STEP2', 'Le pacs.008 part vers STEP2'),
          L('Creditor bank receives the credit', 'La banque du marchand reçoit le crédit'),
          L('Settlement confirmed (ACSC)', 'Règlement confirmé (ACSC)'),
          L('Status echoed to debtor bank', 'Statut renvoyé à la banque débitrice'),
          L('Atelier sees the credit notification', 'Atelier voit la notification de crédit'),
        ],
        ['processing', 'processing', 'processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'pisp-a2a', bankDeepLinkId: 'banque-hub-batch' },
  ),

  scenario(
    'atelier-instant',
    'shop',
    L('Pay instantly (SCT Inst)', 'Payer en instantané (SCT Inst)'),
    L('Same checkout, ≤10s settlement on TIPS / RT1.', 'Même panier, règlement ≤10 s sur TIPS / RT1.'),
    'happy',
    [
      {
        screen: 'cart',
        consumer: L('Organic tee — €42.00', 'T-shirt bio — 42,00 €'),
      },
      ...flowBeats(
        'sct-inst-happy-path',
        [
          L('You pick instant pay-by-bank', 'Vous choisissez le virement instantané'),
          L('PISP posts instant-sepa-credit-transfers', 'Le PISP poste instant-sepa-credit-transfers'),
          L('Bank SCA in the app', 'SCA dans l’app banque'),
          L('pacs.008 INST hits the CSM', 'pacs.008 INST vers le CSM'),
          L('Creditor bank receives in seconds', 'Banque créancière en quelques secondes'),
          L('pacs.002 ACSC within the window', 'pacs.002 ACSC dans la fenêtre'),
          L('Status back to your bank', 'Statut vers votre banque'),
          L('Merchant credited', 'Marchand crédité'),
          L('Shop shows paid', 'La boutique affiche payé'),
        ],
        ['method', 'processing', 'sca', 'processing', 'processing', 'processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'sepa-instant', bankDeepLinkId: 'banque-hub-ip' },
  ),

  scenario(
    'atelier-vop',
    'shop',
    L('Pay with name check (VoP)', 'Payer avec vérification du nom (VoP)'),
    L('Verification of Payee before the instant transfer.', 'Vérification du bénéficiaire avant le virement instantané.'),
    'happy',
    flowBeats(
      'sct-inst-vop',
      [
        L('Checkout asks: does this name match the IBAN?', 'Le panier demande : le nom correspond-il à l’IBAN ?'),
        L('Bank sends acmt.023', 'La banque envoie acmt.023'),
        L('Match confirmed (acmt.024)', 'Correspondance confirmée (acmt.024)'),
        L('Instant payment request', 'Demande de paiement instantané'),
        L('pacs.008 INST in flight', 'pacs.008 INST en cours'),
        L('Settled — receipt', 'Réglé — reçu'),
      ],
      ['method', 'processing', 'processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'sepa-instant' },
  ),

  scenario(
    'atelier-wero',
    'shop',
    L('Pay with Wero', 'Payer avec Wero'),
    L('A2A overlay: intent, proxy resolve, then SCT Inst under the hood.', 'Overlay A2A : intention, résolution proxy, puis SCT Inst.'),
    'happy',
    flowBeats(
      'wero-a2a-payment',
      [
        L('Open Wero at checkout', 'Ouvrir Wero au paiement'),
        L('Resolve merchant alias', 'Résoudre l’alias marchand'),
        L('Approve in your bank', 'Valider dans votre banque'),
        L('Underlying SCT Inst leaves', 'Le SCT Inst sous-jacent part'),
        L('CSM acknowledges', 'Le CSM accuse réception'),
        L('Wero shows COMPLETED', 'Wero affiche COMPLETED'),
      ],
      ['method', 'processing', 'sca', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'wero' },
  ),

  scenario(
    'atelier-stet',
    'shop',
    L('Pay via STET (France)', 'Payer via STET (France)'),
    L('French PISP: create, SCA, then confirm — easy to miss.', 'PISP FR : créer, SCA, puis confirmer — souvent oublié.'),
    'happy',
    [
      { screen: 'cart', consumer: L('Ship to France — use STET', 'Livraison France — passer par STET') },
      ...flowBeats(
        'stet-payment-request',
        [
          L('Create payment request', 'Créer la demande de paiement'),
          L('Bank returns the request resource', 'La banque renvoie la ressource'),
          L('SCA redirect', 'Redirection SCA'),
          L('You must confirm after SCA', 'Il faut confirmer après la SCA'),
          L('Payment accepted', 'Paiement accepté'),
        ],
        ['processing', 'processing', 'sca', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'pisp-a2a' },
  ),

  scenario(
    'atelier-ukob',
    'shop',
    L('Pay via UK Open Banking', 'Payer via UK Open Banking'),
    L('Consent, funds check, then submit with detached JWS.', 'Consentement, contrôle de fonds, puis soumission JWS.'),
    'happy',
    [
      { screen: 'cart', consumer: L('Ship to UK — Open Banking', 'Livraison UK — Open Banking') },
      ...flowBeats(
        'ukob-domestic-payment',
        [
          L('Create domestic payment consent', 'Créer le consentement de paiement'),
          L('Redirect for SCA', 'Redirection SCA'),
          L('Optional funds confirmation', 'Confirmation de fonds optionnelle'),
          L('Submit payment (JWS)', 'Soumettre le paiement (JWS)'),
          L('Payment settled domestically', 'Paiement réglé en domestique'),
        ],
        ['processing', 'sca', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'pisp-a2a' },
  ),

  scenario(
    'atelier-funds',
    'shop',
    L('Check funds before pay', 'Vérifier les fonds avant de payer'),
    L('PIIS boolean: enough money on the account?', 'PIIS booléen : assez d’argent sur le compte ?'),
    'happy',
    flowBeats(
      'bg-funds-confirmation',
      [
        L('Checkout asks the bank: enough funds?', 'Le panier demande à la banque : fonds suffisants ?'),
        L('true — continue to pay-by-bank', 'true — continuer vers le virement'),
      ],
      ['processing', 'receipt'],
    ),
    { paymentId: 'pisp-a2a' },
  ),

  scenario(
    'atelier-sic-chf',
    'shop',
    L('Pay in CHF (SIC)', 'Payer en CHF (SIC)'),
    L('Swiss RTGS customer credit for a CHF invoice.', 'Crédit client RTGS suisse pour une facture CHF.'),
    'happy',
    flowBeats(
      'sic-chf-credit',
      [
        L('CHF checkout at Atelier CH', 'Paiement CHF chez Atelier CH'),
        L('Bank accepts the pain.001', 'La banque accepte le pain.001'),
        L('pacs.008 on SIC', 'pacs.008 sur SIC'),
        L('Settlement on SIC', 'Règlement sur SIC'),
        L('Creditor bank books', 'La banque créancière comptabilise'),
        L('Order confirmed', 'Commande confirmée'),
      ],
      ['cart', 'processing', 'processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'swiss-credit-transfer' },
  ),

  scenario(
    'atelier-eurosic',
    'shop',
    L('EUR via euroSIC', 'EUR via euroSIC'),
    L('EUR clearing leg for a Swiss corridor.', 'Jambe EUR pour un corridor suisse.'),
    'happy',
    flowBeats(
      'eurosic-eur-credit',
      [
        L('EUR order with Swiss bank', 'Commande EUR via banque suisse'),
        L('pacs.008 on euroSIC', 'pacs.008 sur euroSIC'),
        L('Creditor bank receives', 'Banque créancière reçoit'),
        L('ACSC — paid', 'ACSC — payé'),
      ],
      ['cart', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'swiss-credit-transfer' },
  ),

  scenario(
    'atelier-card',
    'shop',
    L('Pay by card', 'Payer par carte'),
    L('Acquirer → scheme → issuer; no ISO pacs in the shop UI.', 'Acquéreur → schéma → émetteur ; pas de pacs dans l’UI boutique.'),
    'happy',
    hopBeats(
      'card-payment',
      ['card-auth', 'card-acq', 'card-scheme', 'card-issuer', 'card-clear', 'card-settle'],
      [
        L('Enter card at checkout', 'Saisir la carte au paiement'),
        L('Merchant sends to acquirer', 'Le marchand envoie à l’acquéreur'),
        L('Card scheme routes', 'Le schéma carte route'),
        L('Issuer authorises', 'L’émetteur autorise'),
        L('Clearing batch', 'Compensation carte'),
        L('Settlement to merchant', 'Règlement marchand'),
      ],
      ['method', 'processing', 'processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'card-payment' },
  ),

  scenario(
    'atelier-paypal',
    'shop',
    L('Pay with digital wallet', 'Payer avec un wallet'),
    L('PayPal / Apple Pay–style funding, then merchant notify.', 'Financement type PayPal / Apple Pay, puis notif marchand.'),
    'happy',
    hopBeats(
      'paypal',
      ['paypal-choose', 'paypal-auth', 'paypal-fund', 'paypal-notify', 'paypal-payout'],
      [
        L('Choose wallet at checkout', 'Choisir le wallet au paiement'),
        L('Approve in the wallet app', 'Valider dans l’app wallet'),
        L('Wallet pulls from your bank', 'Le wallet tire sur votre banque'),
        L('Atelier gets paid notification', 'Atelier reçoit la notification'),
        L('Later payout to merchant IBAN', 'Plus tard, payout vers l’IBAN marchand'),
      ],
      ['method', 'sca', 'processing', 'receipt', 'processing'],
    ),
    { paymentId: 'paypal' },
  ),

  scenario(
    'atelier-curve',
    'shop',
    L('Pay with card overlay', 'Payer avec overlay carte'),
    L('Curve-style: tap one card, pull from another account.', 'Style Curve : une carte, débit d’un autre compte.'),
    'happy',
    hopBeats(
      'curve',
      ['curve-tap', 'curve-acq', 'curve-route', 'curve-pull', 'curve-ok', 'curve-clear', 'curve-settle'],
      [
        L('Tap the overlay card', 'Taper la carte overlay'),
        L('Acquirer sees a normal card sale', 'L’acquéreur voit une vente carte'),
        L('Overlay routes to funding source', 'L’overlay route vers le compte source'),
        L('Pull from your linked account', 'Débit du compte lié'),
        L('Authorisation OK', 'Autorisation OK'),
        L('Clearing', 'Compensation'),
        L('Merchant settled', 'Marchand réglé'),
      ],
      ['method', 'processing', 'processing', 'processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'curve' },
  ),

  scenario(
    'atelier-pix',
    'shop',
    L('Pay with Pix / UPI-style A2A', 'Payer style Pix / UPI'),
    L('Instant A2A by alias — teaching model of Pix/UPI.', 'A2A instantané par alias — modèle pédagogique Pix/UPI.'),
    'happy',
    hopBeats(
      'instant-a2a',
      ['ia2a-alias', 'ia2a-auth', 'ia2a-out', 'ia2a-in', 'ia2a-done'],
      [
        L('Scan merchant QR / alias', 'Scanner QR / alias marchand'),
        L('Approve in banking app', 'Valider dans l’app banque'),
        L('Instant credit leaves', 'Crédit instantané part'),
        L('Merchant bank receives', 'Banque marchande reçoit'),
        L('Paid instantly', 'Payé instantanément'),
      ],
      ['method', 'sca', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'instant-a2a' },
  ),

  scenario(
    'atelier-reject',
    'shop',
    L('Payment rejected', 'Paiement rejeté'),
    L('Wrong IBAN / AM04 — read the pacs.002 RJCT.', 'Mauvais IBAN / AM04 — lire le pacs.002 RJCT.'),
    'reject',
    [
      { screen: 'cart', consumer: L('Organic tee — €42.00', 'T-shirt bio — 42,00 €') },
      ...flowBeats(
        'clearing-reject',
        [
          L('Credit transfer was sent', 'Le virement a été envoyé'),
          L('Creditor bank rejects (RJCT)', 'La banque créancière rejette (RJCT)'),
          L('Reason code surfaces', 'Le code motif apparaît'),
          L('Shop shows payment failed', 'La boutique affiche échec'),
        ],
        ['processing', 'failed', 'failed', 'failed'],
      ),
    ],
    { paymentId: 'sepa-credit-transfer' },
  ),

  scenario(
    'atelier-inst-reject',
    'shop',
    L('Instant reject in-window', 'Rejet instantané dans la fenêtre'),
    L('SCT Inst RJCT still inside the ≤10s SLA.', 'RJCT SCT Inst toujours dans le SLA ≤10 s.'),
    'reject',
    flowBeats(
      'sct-inst-reject',
      [
        L('Instant payment sent', 'Paiement instantané envoyé'),
        L('Creditor rejects inside the window', 'Créancier rejette dans la fenêtre'),
        L('API surfaces RJCT', 'L’API remonte RJCT'),
        L('Checkout shows declined', 'Le panier affiche refusé'),
      ],
      ['processing', 'failed', 'failed', 'failed'],
    ),
    { paymentId: 'sepa-instant' },
  ),

  scenario(
    'atelier-timeout',
    'shop',
    L('Instant timeout', 'Timeout instantané'),
    L('No pacs.002 in time → investigation (pacs.028).', 'Pas de pacs.002 à temps → enquête (pacs.028).'),
    'timeout',
    flowBeats(
      'sepa-instant-timeout',
      [
        L('Instant payment sent', 'Paiement instantané envoyé'),
        L('Clock runs out — still PDNG', 'Le délai expire — encore PDNG'),
        L('Bank sends pacs.028 investigation', 'La banque envoie pacs.028'),
        L('Late pacs.002 arrives', 'pacs.002 tardif arrive'),
        L('Shop still shows pending', 'La boutique reste en attente'),
      ],
      ['processing', 'processing', 'processing', 'processing', 'failed'],
    ),
    { paymentId: 'sepa-instant' },
  ),

  scenario(
    'atelier-cancel',
    'shop',
    L('Cancel before settlement', 'Annuler avant règlement'),
    L('DELETE while cancellable, then camt.055.', 'DELETE tant que annulable, puis camt.055.'),
    'cancel',
    [
      { screen: 'cart', consumer: L('Changed your mind before ship', 'Vous changez d’avis avant l’envoi') },
      ...flowBeats(
        'bg-payment-cancellation',
        [
          L('Payment still cancellable', 'Paiement encore annulable'),
          L('Shop DELETEs the payment', 'La boutique DELETE le paiement'),
          L('Bank issues camt.055', 'La banque émet camt.055'),
          L('Status shows cancelled', 'Statut : annulé'),
        ],
        ['processing', 'processing', 'processing', 'failed'],
      ),
    ],
    { paymentId: 'sepa-credit-transfer' },
  ),

  // ── Nox / Stall (stream) ──────────────────────────────────────────────────
  scenario(
    'nox-subscribe',
    'stream',
    L('Subscribe to Nox (direct debit)', 'S’abonner à Nox (prélèvement)'),
    L('Mandate + monthly SDD collection.', 'Mandat + prélèvement SDD mensuel.'),
    'happy',
    hopBeats(
      'sepa-direct-debit',
      ['sdd-pain', 'sdd-out', 'sdd-in', 'sdd-debit'],
      [
        L('Sign the Nox mandate', 'Signer le mandat Nox'),
        L('Creditor bank sends pain.008', 'Banque créancière envoie pain.008'),
        L('Your bank receives the collection', 'Votre banque reçoit le prélèvement'),
        L('Account debited — Nox active', 'Compte débité — Nox actif'),
      ],
      ['mandate', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'sepa-direct-debit' },
  ),

  scenario(
    'stall-iap',
    'stream',
    L('Buy an app on Stall', 'Acheter une app sur Stall'),
    L('One-shot card / wallet purchase in an app store.', 'Achat ponctuel carte / wallet dans une boutique d’apps.'),
    'happy',
    hopBeats(
      'card-payment',
      ['card-auth', 'card-acq', 'card-scheme', 'card-issuer', 'card-settle'],
      [
        L('Buy “Maps Pro” — €4.99', 'Acheter « Maps Pro » — 4,99 €'),
        L('Stall charges via acquirer', 'Stall facture via l’acquéreur'),
        L('Scheme authorisation', 'Autorisation schéma'),
        L('Issuer OK', 'Émetteur OK'),
        L('App unlocked', 'App débloquée'),
      ],
      ['cart', 'processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'card-payment' },
  ),

  // ── Pocket send (wallet) ──────────────────────────────────────────────────
  scenario(
    'pocket-send-instant',
    'wallet',
    L('Send €25 instantly', 'Envoyer 25 € en instantané'),
    L('Alex pays Marie over SCT Inst.', 'Alex paie Marie en SCT Inst.'),
    'happy',
    [
      {
        screen: 'compose',
        consumer: L('To Marie · €25 · “lunch”', 'Pour Marie · 25 € · « déjeuner »'),
      },
      ...flowBeats(
        'sct-inst-happy-path',
        [
          L('Open Pocket send', 'Ouvrir l’envoi Pocket'),
          L('Bank receives instant instruction', 'La banque reçoit l’instruction instantanée'),
          L('Approve with biometrics', 'Valider par biométrie'),
          L('pacs.008 INST out', 'pacs.008 INST sort'),
          L('Marie’s bank receives', 'La banque de Marie reçoit'),
          L('ACSC within seconds', 'ACSC en secondes'),
          L('Your bank updates status', 'Votre banque met à jour le statut'),
          L('Marie is credited', 'Marie est créditée'),
          L('Sent ✓', 'Envoyé ✓'),
        ],
        ['compose', 'processing', 'sca', 'processing', 'processing', 'processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'sepa-instant', pairScenarioId: 'pocket-recv-instant' },
  ),

  scenario(
    'pocket-send-vop',
    'wallet',
    L('Send with name check', 'Envoyer avec vérification du nom'),
    L('Standalone VoP before you confirm the friend.', 'VoP autonome avant de confirmer l’ami.'),
    'happy',
    [
      { screen: 'compose', consumer: L('To “Marie Lefebvre” · IBAN…', 'Pour « Marie Lefebvre » · IBAN…') },
      ...flowBeats(
        'vop-check',
        [
          L('Pocket asks to verify the name', 'Pocket propose de vérifier le nom'),
          L('acmt.023 to the creditor bank', 'acmt.023 vers la banque créancière'),
          L('Match / close match / no match', 'Correspondance / proche / aucune'),
          L('You confirm and send', 'Vous confirmez et envoyez'),
        ],
        ['processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'sepa-instant' },
  ),

  scenario(
    'pocket-send-wero',
    'wallet',
    L('Send via Wero (phone)', 'Envoyer via Wero (téléphone)'),
    L('Alias / phone number, then SCT Inst underneath.', 'Alias / téléphone, puis SCT Inst en dessous.'),
    'happy',
    flowBeats(
      'wero-a2a-payment',
      [
        L('Enter Marie’s phone in Pocket', 'Saisir le téléphone de Marie'),
        L('Proxy resolves to an IBAN', 'Le proxy résout vers un IBAN'),
        L('Approve in bank', 'Valider à la banque'),
        L('Instant rail carries it', 'Le rail instantané transporte'),
        L('CSM ack', 'Ack CSM'),
        L('Marie notified — COMPLETED', 'Marie notifiée — COMPLETED'),
      ],
      ['compose', 'processing', 'sca', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'wero', pairScenarioId: 'pocket-recv-wero' },
  ),

  scenario(
    'pocket-send-sct',
    'wallet',
    L('Send next-day SCT', 'Envoyer en SCT J+1'),
    L('Classic credit transfer when instant is off.', 'Virement classique si l’instantané est off.'),
    'happy',
    [
      { screen: 'compose', consumer: L('To Marie · €25 · next business day', 'Pour Marie · 25 € · jour ouvré suivant') },
      ...flowBeats(
        'clearing-sct-happy-path',
        [
          L('Bank accepts your transfer', 'La banque accepte votre virement'),
          L('pacs.008 to STEP2', 'pacs.008 vers STEP2'),
          L('Marie’s bank receives overnight', 'Banque de Marie le lendemain'),
          L('Settled', 'Réglé'),
          L('Your bank sees ACSC', 'Votre banque voit ACSC'),
          L('Marie gets camt.054', 'Marie reçoit camt.054'),
        ],
        ['processing', 'processing', 'processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'sepa-credit-transfer', pairScenarioId: 'pocket-recv-sct' },
  ),

  scenario(
    'pocket-recall',
    'wallet',
    L('Wrong friend — recall', 'Mauvaise personne — rappel'),
    L('camt.056 → resolution → pacs.004 return.', 'camt.056 → résolution → retour pacs.004.'),
    'recall',
    [
      { screen: 'compose', consumer: L('You sent to the wrong Marie', 'Vous avez envoyé à la mauvaise Marie') },
      ...flowBeats(
        'clearing-recall',
        [
          L('Ask the bank to recall', 'Demander un rappel à la banque'),
          L('Recall reaches creditor bank', 'Le rappel atteint la banque créancière'),
          L('They accept or refuse', 'Ils acceptent ou refusent'),
          L('Funds returned (pacs.004)', 'Fonds retournés (pacs.004)'),
        ],
        ['processing', 'processing', 'processing', 'receipt'],
      ),
    ],
    { paymentId: 'sepa-credit-transfer', pairScenarioId: 'pocket-recv-recall' },
  ),

  scenario(
    'pocket-inst-recall',
    'wallet',
    L('Recall an instant payment', 'Rappeler un paiement instantané'),
    L('Same recall path after SCT Inst settlement.', 'Même chemin de rappel après règlement SCT Inst.'),
    'recall',
    flowBeats(
      'sct-inst-recall',
      [
        L('Request recall after settle', 'Demander un rappel après règlement'),
        L('Instant recall to creditor bank', 'Rappel instantané vers créancier'),
        L('Resolution', 'Résolution'),
        L('Return booked', 'Retour comptabilisé'),
      ],
      ['processing', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'sepa-instant' },
  ),

  // ── Pocket receive ────────────────────────────────────────────────────────
  scenario(
    'pocket-recv-instant',
    'receive',
    L('Alex sent you €25 (instant)', 'Alex vous a envoyé 25 € (instantané)'),
    L('Beneficiary view: push → credit in seconds.', 'Côté bénéficiaire : notif → crédit en secondes.'),
    'happy',
    [
      {
        screen: 'notify',
        consumer: L('Alex sent you €25', 'Alex vous a envoyé 25 €'),
        flowId: 'sct-inst-happy-path',
        step: 5,
      },
      {
        screen: 'incoming',
        consumer: L('Incoming · Instant', 'Entrant · Instantané'),
        flowId: 'sct-inst-happy-path',
        step: 6,
      },
      {
        screen: 'credited',
        consumer: L('+€25 · EndToEndId lunch-…', '+25 € · EndToEndId lunch-…'),
        flowId: 'sct-inst-happy-path',
        step: 8,
        sampleId: 'camt-054-credit',
      },
      {
        screen: 'statement',
        consumer: L('See it on your account list', 'Le voir sur le relevé'),
        flowId: 'bg-ais-consent-redirect',
        step: 7,
      },
    ],
    { paymentId: 'sepa-instant', pairScenarioId: 'pocket-send-instant' },
  ),

  scenario(
    'pocket-recv-sct',
    'receive',
    L('Alex sent you €25 (next day)', 'Alex vous a envoyé 25 € (J+1)'),
    L('Pending overnight, then camt.054.', 'En attente la nuit, puis camt.054.'),
    'happy',
    [
      {
        screen: 'notify',
        consumer: L('Alex initiated €25', 'Alex a initié 25 €'),
        flowId: 'clearing-sct-happy-path',
        step: 3,
      },
      {
        screen: 'incoming',
        consumer: L('Incoming · Pending settlement', 'Entrant · En attente de règlement'),
        flowId: 'clearing-sct-happy-path',
        step: 4,
      },
      {
        screen: 'credited',
        consumer: L('+€25 credited', '+25 € crédités'),
        flowId: 'clearing-sct-happy-path',
        step: 6,
      },
    ],
    { paymentId: 'sepa-credit-transfer', pairScenarioId: 'pocket-send-sct' },
  ),

  scenario(
    'pocket-recv-wero',
    'receive',
    L('Alex paid you via Wero', 'Alex vous a payé via Wero'),
    L('Payee COMPLETED on the overlay.', 'COMPLETED côté bénéficiaire sur l’overlay.'),
    'happy',
    [
      {
        screen: 'notify',
        consumer: L('Alex · Wero · €25', 'Alex · Wero · 25 €'),
        flowId: 'wero-a2a-payment',
        step: 4,
      },
      {
        screen: 'incoming',
        consumer: L('Instant credit landing', 'Crédit instantané en cours'),
        flowId: 'wero-a2a-payment',
        step: 5,
      },
      {
        screen: 'credited',
        consumer: L('COMPLETED on Pocket', 'COMPLETED sur Pocket'),
        flowId: 'wero-a2a-payment',
        step: 6,
      },
    ],
    { paymentId: 'wero', pairScenarioId: 'pocket-send-wero' },
  ),

  scenario(
    'pocket-recv-recall',
    'receive',
    L('Incoming recall from Alex', 'Rappel entrant d’Alex'),
    L('Alex asked to take the money back.', 'Alex demande à récupérer les fonds.'),
    'recall',
    [
      {
        screen: 'notify',
        consumer: L('Recall request on €25', 'Demande de rappel sur 25 €'),
        flowId: 'clearing-recall',
        step: 1,
      },
      {
        screen: 'incoming',
        consumer: L('Your bank reviews the recall', 'Votre banque examine le rappel'),
        flowId: 'clearing-recall',
        step: 2,
      },
      {
        screen: 'failed',
        consumer: L('Funds returned to Alex', 'Fonds renvoyés à Alex'),
        flowId: 'clearing-recall',
        step: 4,
      },
    ],
    { paymentId: 'sepa-credit-transfer', pairScenarioId: 'pocket-recall' },
  ),

  // ── Banque ────────────────────────────────────────────────────────────────
  scenario(
    'banque-ais',
    'bank',
    L('Connect a budgeting app', 'Connecter une app de budget'),
    L('AIS consent with redirect SCA, then accounts & transactions.', 'Consentement AIS + SCA, puis comptes & transactions.'),
    'happy',
    flowBeats(
      'bg-ais-consent-redirect',
      [
        L('App asks to read your accounts', 'L’app demande à lire vos comptes'),
        L('POST /v1/consents', 'POST /v1/consents'),
        L('Consent received — not valid yet', 'Consentement received — pas encore valid'),
        L('Redirect to bank SCA', 'Redirection SCA banque'),
        L('Poll consent status → valid', 'Poll statut → valid'),
        L('List accounts', 'Lister les comptes'),
        L('Fetch transactions', 'Récupérer les transactions'),
      ],
      ['consent', 'processing', 'processing', 'sca', 'processing', 'inbox', 'statement'],
    ),
    { paymentId: 'sepa-credit-transfer' },
  ),

  scenario(
    'banque-hub-ip',
    'bank',
    L('Inside the bank: instant hub', 'Dans la banque : hub instantané'),
    L('AGI → Payment Hub → ILM → CBS for an IP.', 'AGI → Payment Hub → ILM → CBS pour un IP.'),
    'happy',
    flowBeats(
      'hub-ip-transaction-flow',
      [
        L('Inbound pacs.008 INST at AGI', 'pacs.008 INST entrant à l’AGI'),
        L('Hub routes the payment', 'Le hub route le paiement'),
        L('ILM checks liquidity', 'L’ILM vérifie la liquidité'),
        L('Reservation OK', 'Réservation OK'),
        L('CBS holds funds', 'Le CBS réserve les fonds'),
        L('pacs.002 ACSC prepared', 'pacs.002 ACSC préparé'),
        L('Reply path', 'Chemin de réponse'),
        L('Status to counterparty', 'Statut vers la contrepartie'),
        L('Books final', 'Comptabilité finale'),
      ],
      ['hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'receipt'],
    ),
    { paymentId: 'sepa-instant' },
  ),

  scenario(
    'banque-hub-batch',
    'bank',
    L('Inside the bank: batch hub', 'Dans la banque : hub batch'),
    L('Same architecture for non-instant SCT.', 'Même architecture pour le SCT non instantané.'),
    'happy',
    flowBeats(
      'hub-non-ip-transaction-flow',
      [
        L('Inbound pacs.008 at AGI', 'pacs.008 entrant à l’AGI'),
        L('Hub routes batch', 'Le hub route le batch'),
        L('ILM liquidity check', 'Contrôle liquidité ILM'),
        L('Reservation', 'Réservation'),
        L('CBS fund hold', 'Réserve CBS'),
        L('pacs.002 ACSC', 'pacs.002 ACSC'),
        L('Outbound status', 'Statut sortant'),
        L('Counterparty update', 'Mise à jour contrepartie'),
        L('Books closed for the cycle', 'Écritures du cycle'),
      ],
      ['hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'hub', 'receipt'],
    ),
    { paymentId: 'sepa-credit-transfer' },
  ),

  scenario(
    'banque-sic-ip',
    'bank',
    L('SIC Instant Payment', 'SIC Instant Payment'),
    L('CHF instant on the Swiss rail.', 'Instantané CHF sur le rail suisse.'),
    'happy',
    flowBeats(
      'sic-ip-instant',
      [
        L('SIC IP pacs.008 in', 'pacs.008 SIC IP entrant'),
        L('Bank processes in the SLA', 'La banque traite dans le SLA'),
        L('pacs.002 on SIC IP', 'pacs.002 sur SIC IP'),
        L('Customer credited', 'Client crédité'),
      ],
      ['inbox', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'swiss-credit-transfer' },
  ),

  scenario(
    'banque-sic-ip-timeout',
    'bank',
    L('SIC IP timeout', 'Timeout SIC IP'),
    L('Enquiry when the instant reply is missing.', 'Enquête quand la réponse instantanée manque.'),
    'timeout',
    flowBeats(
      'sic-ip-timeout',
      [
        L('SIC IP sent', 'SIC IP envoyé'),
        L('No timely ack', 'Pas d’ack à temps'),
        L('Enquiry / investigation', 'Enquête'),
        L('Ops decides next step', 'Ops décide de la suite'),
      ],
      ['processing', 'failed', 'processing', 'failed'],
    ),
    { paymentId: 'swiss-credit-transfer' },
  ),

  scenario(
    'banque-target2',
    'bank',
    L('TARGET2 regular euro credit', 'Virement euro régulier TARGET2'),
    L('T2 RTGS counterpart to TIPS — settle in central bank money.', 'Contrepartie T2 RTGS de TIPS — règlement en monnaie banque centrale.'),
    'happy',
    flowBeats(
      'target2-regular-payment',
      [
        L('pacs.008 into T2 RTGS', 'pacs.008 dans T2 RTGS'),
        L('TARGET2 delivers to creditor PSP', 'TARGET2 livre au PSP créancier'),
        L('Creditor confirms ACSC', 'Le créancier confirme ACSC'),
        L('Status back to debtor bank', 'Statut vers la banque débitrice'),
      ],
      ['inbox', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'sepa-credit-transfer' },
  ),

  scenario(
    'banque-swift',
    'bank',
    L('Cross-border SWIFT / CBPR+', 'Transfrontalier SWIFT / CBPR+'),
    L('pain → pacs.008 (or pacs.009) across correspondent banks.', 'pain → pacs.008 (ou pacs.009) entre correspondants.'),
    'happy',
    hopBeats(
      'swift-credit-transfer',
      ['swift-init', 'swift-008', 'swift-mid', 'swift-002'],
      [
        L('Corporate instructs a wire', 'L’entreprise initie un virement'),
        L('pacs.008 on SWIFT', 'pacs.008 sur SWIFT'),
        L('Correspondent forwards', 'Le correspondant relaie'),
        L('Beneficiary bank confirms', 'Banque bénéficiaire confirme'),
      ],
      ['compose', 'processing', 'processing', 'receipt'],
    ),
    { paymentId: 'swift-credit-transfer' },
  ),

  scenario(
    'banque-cancel',
    'bank',
    L('Cancel from pending list', 'Annuler depuis la liste en attente'),
    L('Same cancellation flow, started from the bank inbox.', 'Même annulation, démarrée depuis la boîte banque.'),
    'cancel',
    flowBeats(
      'bg-payment-cancellation',
      [
        L('Pending payment in inbox', 'Paiement en attente dans la boîte'),
        L('DELETE while cancellable', 'DELETE tant que annulable'),
        L('camt.055 cancellation request', 'Demande camt.055'),
        L('Marked cancelled', 'Marqué annulé'),
      ],
      ['inbox', 'processing', 'processing', 'failed'],
    ),
    { paymentId: 'sepa-credit-transfer' },
  ),
];

export const lifeSceneById = (id: string) => LIFE_SCENES.find((s) => s.id === id);

export const lifeScenarioById = (id: string) => LIFE_SCENARIOS.find((s) => s.id === id);

export function scenariosForScene(sceneId: LifeSceneId): LifeScenario[] {
  return LIFE_SCENARIOS.filter((s) => s.sceneId === sceneId);
}
