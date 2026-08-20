import type { Flow, FlowStep } from '@/types';
import type { Locale } from '@/i18n/types';

export type FlowStepI18n = { label: string; detail: string };

export type FlowI18n = {
  name: string;
  summary: string;
  useCase: string;
  steps: Record<number, FlowStepI18n>;
};

/** Overlay French copy onto a catalog flow. English remains the source in `data/flows`. */
export function localizeFlow(flow: Flow, locale: Locale): Flow {
  if (locale !== 'fr') return flow;
  const tr = FLOWS_FR[flow.id];
  if (!tr) return flow;
  return {
    ...flow,
    name: tr.name,
    summary: tr.summary,
    useCase: tr.useCase,
    steps: flow.steps.map((step) => localizeStep(step, tr.steps[step.n])),
  };
}

export function localizeFlows(flows: Flow[], locale: Locale): Flow[] {
  return flows.map((f) => localizeFlow(f, locale));
}

function localizeStep(step: FlowStep, tr?: FlowStepI18n): FlowStep {
  if (!tr) return step;
  return { ...step, label: tr.label, detail: tr.detail };
}

export const ACTORS_FR: Record<string, { label: string; sublabel: string }> = {
  psu: { label: 'PSU', sublabel: 'Utilisateur de services de paiement' },
  tpp: { label: 'TPP', sublabel: 'AISP / PISP' },
  aspsp: { label: 'ASPSP', sublabel: 'Banque teneur de compte' },
  sca: { label: 'SCA', sublabel: 'Service d’authentification' },
  csm: { label: 'CSM', sublabel: 'Compensation & règlement' },
  beneficiary: { label: 'Banque créancière', sublabel: 'Côté bénéficiaire' },
  rail: { label: 'Rail SIC', sublabel: 'SIC / euroSIC / SIC IP' },
  scheme: { label: 'Overlay A2A', sublabel: 'Schéma A2A retail (ex. Wero)' },
};

export const FLOWS_FR: Record<string, FlowI18n> = {
  'bg-ais-consent-redirect': {
    name: 'Accès aux comptes avec SCA redirect',
    summary:
      'Le parcours AIS canonique : créer un consentement, envoyer le PSU à la banque pour s’authentifier, puis lire les données jusqu’à expiration du consentement.',
    useCase:
      'Tout agrégateur de comptes commence ici. La plupart des échecs d’intégration sont aux étapes 2 et 5 — le contrat de redirect et le moment où le consentement passe à valid.',
    steps: {
      1: {
        label: 'Choisir une banque, accepter le partage',
        detail:
          'Le TPP montre quelles données il veut et pour combien de temps. Cet écran est la base légale du champ access que vous allez envoyer — gardez-les alignés ou vous échouerez un audit.',
      },
      2: {
        label: 'Créer la ressource consentement',
        detail:
          'L’objet access décide de tout ce qui suit. availableAccounts ne donne que la liste ; balances et transactions ont chacune leur tableau. validUntil est plafonné par l’ASPSP quoi que vous demandiez.',
      },
      3: {
        label: 'consentId + lien scaRedirect',
        detail:
          'consentStatus vaut received. L’objet _links indique l’approche SCA choisie — scaRedirect, scaOAuth ou startAuthorisation. Branchez-vous sur le lien, jamais sur la doc.',
      },
      4: {
        label: 'S’authentifier à la banque',
        detail:
          'Redirect navigateur ou app-to-app. Vous perdez le contrôle : le PSU peut abandonner, le lien expirer, la banque changer la sélection de comptes. Traitez le callback comme une entrée non fiable.',
      },
      5: {
        label: 'Poller jusqu’à consentement valid',
        detail:
          'Poller le statut, pas le consentement complet — moins cher, et certaines banques rate-limitent le second. États terminaux : valid, rejected, revokedByPsu et expired.',
      },
      6: {
        label: 'Lister les comptes',
        detail:
          'Retourne des resourceIds opaques et liés au consentement. Ne les mettez pas en cache entre consentements ; ne supposez pas que ce sont des IBAN.',
      },
      7: {
        label: 'Lire les transactions',
        detail:
          'bookingStatus=both renvoie booked et pending en un appel. Avec Accept: application/xml, un ASPSP conforme renvoie du camt.052 au lieu du JSON — utile si vous avez déjà un parseur ISO.',
      },
    },
  },

  'bg-pis-sepa-redirect': {
    name: 'Virement SEPA avec SCA découplée',
    summary:
      'Un paiement SEPA initié par un PISP, autorisé dans l’app bancaire plutôt que par redirect navigateur. L’endpoint de statut est la seule source de vérité.',
    useCase:
      'La SCA découplée se répand car elle survit aux navigateurs mobiles. Le coût : du polling et un pire cas beaucoup plus long.',
    steps: {
      1: {
        label: 'Initier le paiement',
        detail:
          'TPP-Explicit-Authorisation-Preferred=true demande une sous-ressource d’autorisation séparée, utile si vous proposez le choix de méthode SCA.',
      },
      2: {
        label: 'Démarrer l’autorisation',
        detail: 'Retourne un authorisationId et les méthodes SCA disponibles s’il y en a plusieurs.',
      },
      3: {
        label: 'Sélectionner la méthode SCA',
        detail:
          'scaStatus passe à scaMethodSelected, puis started une fois que la banque a poussé le challenge sur l’appareil du PSU.',
      },
      4: {
        label: 'Push du challenge vers l’app banque',
        detail:
          'Hors bande. Le PSU peut ne jamais ouvrir la notif : traitez l’abandon comme le cas par défaut et fixez une échéance.',
      },
      5: {
        label: 'Poller le statut de transaction',
        detail:
          'Backoff exponentiel. ACSP = accepté pour règlement — l’argent est engagé mais pas encore compensé. Seul ACSC est final.',
      },
      6: {
        label: 'pacs.008 vers la compensation',
        detail:
          'La couche API s’arrête ici. Ce que le TPP appelait un paiement devient un virement interbancaire ; chaque erreur aval arrive en code motif ISO, pas en HTTP.',
      },
    },
  },

  'stet-payment-request': {
    name: 'Demande de paiement STET et confirmation',
    summary:
      'Le profil français. Deux appels comptent : créer la demande de paiement, puis la confirmer après SCA. Oublier la confirmation est le bug STET le plus courant.',
    useCase:
      'Tout PISP opérant en France. L’exigence de signature HTTP en fait le standard le moins indulgent à déboguer.',
    steps: {
      1: {
        label: 'Obtenir un jeton client_credentials',
        detail: 'grant_type=client_credentials avec scope=pisp. Le jeton est lié au QWAC utilisé pour le mTLS.',
      },
      2: {
        label: 'Créer la demande de paiement',
        detail:
          'Le corps mime pain.001 : paymentInformationId, tableau creditTransferTransaction, bloc bénéficiaire. Signez (request-target), date, digest et x-request-id avec votre QSealC.',
      },
      3: {
        label: 'S’authentifier via consentApprovalUrl',
        detail: 'Le href _links.consentApproval du 201. Redirigez le PSU et attendez le callback.',
      },
      4: {
        label: 'Confirmer la demande de paiement',
        detail:
          'Sans cet appel la demande reste non confirmée et expire. En mode découplé le corps porte psuAuthenticationFactor ; en redirect il doit être vide.',
      },
      5: {
        label: 'Lire le statut final',
        detail: 'paymentInformationStatus en tête, statuts de transaction individuels en dessous. Lisez les deux.',
      },
    },
  },

  'ukob-domestic-payment': {
    name: 'Paiement domestique UK avec JWS détaché',
    summary:
      'Consentement, contrôle de fonds, soumission. Les blocs Initiation du consentement et du paiement doivent être octet-identiques, et les deux écritures portent un JWS détaché.',
    useCase:
      'Travail PISP UK. La rigueur paie : une fois conforme, le comportement est remarquablement uniforme entre banques.',
    steps: {
      1: {
        label: 'Créer le consentement de paiement',
        detail:
          'Initiation plus un bloc Risk. x-jws-signature est un JWS détaché sur le corps avec b64=false et les claims OB dans l’en-tête.',
      },
      2: {
        label: 'Autoriser via OIDC avec liaison d’intent',
        detail:
          'PAR + PKCE, request object signé, openbanking_intent_id = ConsentId. Redirect app-to-app si la banque le permet.',
      },
      3: {
        label: 'Confirmer les fonds',
        detail: 'Booléen seulement, valide uniquement après autorisation. Un false évite un paiement rejeté.',
      },
      4: {
        label: 'Soumettre le paiement',
        detail:
          'Le bloc Initiation doit matcher le consentement exactement. Nouvelle x-idempotency-key, et en retry la même clé plutôt qu’une nouvelle.',
      },
      5: {
        label: 'Lire le statut',
        detail:
          'Pending, AcceptedSettlementInProgress, AcceptedCreditSettlementCompleted ou Rejected. Ce sont des noms OBIE, pas des codes ISO — ne les mappez pas un-à-un sur ACSP/ACSC.',
      },
    },
  },

  'bg-funds-confirmation': {
    name: 'Confirmation de fonds (PIIS)',
    summary: 'Un appel, un booléen. Pas de montant, pas de solde, pas d’historique.',
    useCase:
      'Émetteurs de cartes qui vérifient la couverture avant autorisation. Le scope le plus étroit de la PSD2 et le plus facile à faire approuver.',
    steps: {
      1: {
        label: 'Demander si les fonds sont disponibles',
        detail:
          'Nécessite un consentement PIIS établi hors API — souvent à l’émission de la carte. cardNumber est optionnel mais la plupart des banques le veulent pour le matching.',
      },
      2: {
        label: 'fundsAvailable: true | false',
        detail: 'C’est tout le corps de réponse. Plus serait contraire à la minimisation des données du RTS.',
      },
    },
  },

  'clearing-sct-happy-path': {
    name: 'Jambe de compensation : initiation au règlement',
    summary:
      'Ce qui se passe après le succès de l’appel API. pain.001 devient pacs.008, le CSM répond en pacs.002, et les deux côtés sont notifiés.',
    useCase:
      'À lire quand un paiement affiche ACSP en API mais que le bénéficiaire n’a rien reçu. La réponse est toujours dans cette jambe.',
    steps: {
      1: {
        label: 'pain.001 initiation reçue',
        detail: 'Qu’elle arrive en JSON ou XML, la banque débitrice la normalise en pain.001 en interne.',
      },
      2: {
        label: 'pacs.008 soumis',
        detail:
          'SttlmMtd=CLRG pour le SEPA. IntrBkSttlmAmt remplace InstdAmt, et le TxId assigné ici est l’identifiant que le CSM vous citera.',
      },
      3: {
        label: 'pacs.008 transmis',
        detail: 'La banque créancière valide l’IBAN, filtre sanctions et vérifie que le compte est ouvert.',
      },
      4: {
        label: 'pacs.002 — TxSts ACSC',
        detail: 'Accepté, règlement terminé. En SEPA Instant cela doit revenir en moins de dix secondes de bout en bout.',
      },
      5: {
        label: 'pacs.002 relayé à la banque débitrice',
        detail: 'Ce n’est qu’alors que la couche API peut passer le paiement de ACSP à ACSC.',
      },
      6: {
        label: 'camt.054 notification de crédit',
        detail: 'Ce à quoi un commerçant s’abonne pour livrer sans attendre le relevé de fin de journée.',
      },
    },
  },

  'clearing-reject': {
    name: 'Rejet : lire un pacs.002 RJCT',
    summary:
      'Paiement refusé avant règlement. Le code motif dit s’il faut réessayer, corriger les données, ou s’arrêter.',
    useCase:
      'La taxonomie des rejets est la chose la plus utile à intérioriser. AC01 est un bug de données corrigible ; AM04 un problème client ; MS03 ne dit rien volontairement.',
    steps: {
      1: {
        label: 'pacs.008 soumis',
        detail: 'Rien ne semble anormal — la banque débitrice a accepté l’instruction.',
      },
      2: {
        label: 'pacs.002 — TxSts RJCT, Rsn AC01',
        detail:
          'StsRsnInf/Rsn/Cd porte le code External Status Reason. AC01 = identifiant de compte incorrect : l’IBAN n’existe pas chez cette banque. Ne jamais réessayer tel quel.',
      },
      3: {
        label: 'Rejet relayé, fonds libérés',
        detail:
          'La banque débitrice lève sa réservation interne. La couche API expose transactionStatus RJCT.',
      },
      4: {
        label: 'Le TPP voit RJCT',
        detail:
          'Berlin Group n’a pas de champ pour le motif ISO dans le statut. Pour obtenir AC01 plutôt que « rejected », il faut le canal reporting banque — asymétrie réelle du standard.',
      },
    },
  },

  'clearing-recall': {
    name: 'Rappel : camt.056 vers pacs.004',
    summary:
      'Récupérer de l’argent déjà réglé. La banque débitrice demande l’annulation, la créancière répond, et si positif les fonds reviennent en pacs.004.',
    useCase:
      'Fraude et doublons. La banque créancière n’est pas obligée d’accepter — un rappel est une demande, pas une instruction.',
    steps: {
      1: {
        label: 'camt.056 demande d’annulation',
        detail:
          'CxlRsnInf/Rsn/Cd porte DUPL, TECH, FRAD ou CUST. Selon le rulebook SEPA : dans les 13 mois, et 10 jours pour un doublon technique.',
      },
      2: {
        label: 'Demande transmise',
        detail: 'La banque créancière vérifie si les fonds sont encore là et si l’accord du client est requis.',
      },
      3: {
        label: 'camt.029 résolution',
        detail:
          'Sts/Conf=ACCR si accepté. Un refus porte un motif comme ARDT (déjà retourné), NOAS (pas de réponse client) ou LEGL (décision légale).',
      },
      4: {
        label: 'pacs.004 retour',
        detail:
          'Seulement après un camt.029 positif. RtrRsnInf/Rsn/Cd reprend le motif d’annulation pour le rapprochement.',
      },
    },
  },

  'sct-inst-happy-path': {
    name: 'SCT Inst — chemin heureux (≤10s)',
    summary:
      'Virement euro instantané complet : le PISP initie instant-sepa-credit-transfers, la banque débitrice soumet un pacs.008 avec LclInstrm=INST via TIPS/RT1, le créancier confirme ACSC, les deux côtés notifient.',
    useCase:
      'Le parcours Instant Payments Regulation de référence. Si quelque chose dépasse dix secondes de bout en bout, vous êtes hors SLA du schéma.',
    steps: {
      1: {
        label: 'Choisir le virement instantané',
        detail:
          'Le PSU opte pour l’instantané (ou l’IPR en fait le défaut pour les CT euro). Affichez la parité tarifaire vs SCT standard si requis.',
      },
      2: {
        label: 'Initier SCT Inst via XS2A',
        detail:
          'Chemin produit Berlin Group. Même forme JSON que sepa-credit-transfers ; le segment produit sélectionne le traitement INST.',
      },
      3: {
        label: 'SCA / autorisation',
        detail:
          'L’heure de réception / autorisation démarre l’horloge du schéma (AT-T056). Ne démarrez pas le chrono UX plus tôt.',
      },
      4: {
        label: 'pacs.008 INST → TIPS/RT1',
        detail:
          'Fonds réservés immédiatement. LclInstrm/Cd=INST ; ClrSys pointe TIPS ou RT1. La fenêtre d’acceptation se compte en secondes.',
      },
      5: {
        label: 'Transmission au PSP créancier',
        detail: 'Le PSP créancier valide IBAN, LCB/FT et statut du compte sous le SLA instantané.',
      },
      6: {
        label: 'pacs.002 accusé ACSC',
        detail: 'Fonds mis à disposition du bénéficiaire. Seul ACSC clôt le chemin heureux selon le rulebook.',
      },
      7: {
        label: 'Confirmation au PSP débiteur',
        detail: 'La banque débitrice libère la réservation comme réglée et peut passer le statut API à ACSC.',
      },
      8: {
        label: 'camt.054 notification de crédit',
        detail: 'Déclencheur côté commerçant / bénéficiaire pour livrer sans attendre la fin de journée.',
      },
      9: {
        label: 'Statut API ACSC + notifier le PSU',
        detail:
          'L’IPR exige que le PSP donneur d’ordre informe le payeur. Les UI PISP doivent afficher ACSC, pas rester sur PDNG.',
      },
    },
  },

  'sct-inst-reject': {
    name: 'Rejet SCT Inst dans la fenêtre',
    summary:
      'Le PSP créancier refuse dans le SLA de 10 s. La banque débitrice lève la réservation et renvoie RJCT + motif au TPP.',
    useCase:
      'Distinguez erreurs de données dures (AC01), joignabilité (AB05) et fonds (AM04) — seuls certains sont sûrs à retenter en SCT.',
    steps: {
      1: {
        label: 'pacs.008 INST soumis',
        detail: 'Réservation posée ; l’horloge tourne.',
      },
      2: {
        label: 'pacs.002 RJCT',
        detail:
          'Confirmation négative encore dans le SLA. Le motif décide de la suite — ne jamais retenter INST à l’aveugle.',
      },
      3: {
        label: 'Rejet relayé',
        detail: 'La banque débitrice lève immédiatement la réservation.',
      },
      4: {
        label: 'API RJCT + tppMessages',
        detail:
          'Exposez le motif ISO si l’ASPSP le fournit. AB05 → proposer SCT standard ; AC01 → corriger l’IBAN ; AM04 → demander au PSU.',
      },
    },
  },

  'sct-inst-vop': {
    name: 'SCT Inst avec Verification of Payee',
    summary:
      'Parcours Instant Payments Regulation : lancer la VoP (acmt.023/024) avant d’initier le virement instantané, puis régler en SCT Inst.',
    useCase:
      'Contrôle du bénéficiaire obligatoire pour les CT euro instantanés. Close-match à afficher ; no-match exige une acceptation explicite du risque par le PSU.',
    steps: {
      1: {
        label: 'Saisir nom + IBAN du bénéficiaire',
        detail: 'Capturez le nom tapé — la VoP compare ce que le PSU a saisi, pas un cache normalisé.',
      },
      2: {
        label: 'acmt.023 demande VoP',
        detail: 'Verification of Payee IPR avant autorisation de l’ordre instantané.',
      },
      3: {
        label: 'acmt.024 rapport de match',
        detail:
          'MTCH / CMTC / NMTC. Sur CMTC affichez le nom légal suggéré ; sur NMTC exigez un continue explicite.',
      },
      4: {
        label: 'Initier SCT Inst après VoP',
        detail:
          'Seulement après acceptation du résultat VoP par le PSU. Journalisez le résultat VoP avec le paiement pour la responsabilité.',
      },
      5: {
        label: 'pacs.008 INST',
        detail: 'Même chemin de compensation instantanée que le chemin heureux.',
      },
      6: {
        label: 'pacs.002 ACSC',
        detail: 'Confirmation de règlement instantané.',
      },
    },
  },

  'sct-inst-recall': {
    name: 'Rappel SCT Inst après règlement',
    summary:
      'Les paiements instantanés restent rappelables (fraude, doublon, technique). camt.056 → camt.029 → pacs.004, avec une urgence opérationnelle plus forte que le SCT batch.',
    useCase:
      'Le PSU signale une fraude quelques minutes après un crédit instantané. Les fonds peuvent déjà être retirés — un camt.029 négatif est fréquent.',
    steps: {
      1: {
        label: 'camt.056 rappel (FRAD/DUPL)',
        detail: 'Agissez vite pour la fraude. Instantané ne veut pas dire irréversible sans tentative de rappel.',
      },
      2: {
        label: 'Rappel vers le PSP créancier',
        detail: 'Le créancier vérifie si les fonds restent et si le consentement client est requis.',
      },
      3: {
        label: 'camt.029 résolution',
        detail:
          'ACCR → le retour suit. NOAS / ARDT / LEGL → pas de fonds ; informez honnêtement le PSP donneur d’ordre.',
      },
      4: {
        label: 'pacs.004 retour (si accepté)',
        detail: 'Seulement après résolution positive. FOCR rattache le retour au dossier de rappel.',
      },
    },
  },

  'sepa-instant-timeout': {
    name: 'Timeout SCT Inst & investigation',
    summary:
      'Pas de pacs.002 dans la fenêtre. La banque débitrice ne sait pas si le paiement a réglé, et doit lever l’ambiguïté avant de dire quoi que ce soit.',
    useCase:
      'L’état le plus dur des paiements instantanés. Deviner ici crée des doubles paiements ou des clients en colère — l’investigation est obligatoire.',
    steps: {
      1: {
        label: 'pacs.008 soumis, chrono démarré',
        detail:
          'SCT Inst donne environ dix secondes à toute la chaîne depuis la réception. La banque débitrice réserve les fonds immédiatement.',
      },
      2: {
        label: 'Timeout — pas de réponse',
        detail:
          'Le paiement n’est ni réglé ni rejeté. Gardez la réservation ; ne dites pas au PSU que c’est échoué ; ne ré-initiez pas.',
      },
      3: {
        label: 'pacs.028 demande de statut',
        detail: 'Enquête formelle citant EndToEndId / TxId. Backoff automatisé, pas un ticket manuel.',
      },
      4: {
        label: 'pacs.002 tardif',
        detail:
          'Souvent ACSC, parfois RJCT. Si silence après la fenêtre d’investigation, traitez comme rejeté selon le rulebook.',
      },
      5: {
        label: 'Le statut reste PDNG',
        detail:
          'Les clients PISP ne doivent jamais traiter un long PDNG comme un échec. Ré-initier ici, c’est créer des doublons.',
      },
    },
  },

  'vop-check': {
    name: 'Verification of Payee',
    summary:
      'Appariement nom + IBAN avant qu’un virement parte. Obligatoire dans la zone euro depuis l’échéance Instant Payments Regulation d’octobre 2025.',
    useCase:
      'Un pré-contrôle qui change l’UX PISP : le PSU peut devoir confirmer un mismatch — votre écran d’initiation a besoin d’un état qu’il n’avait pas.',
    steps: {
      1: {
        label: 'Nom et IBAN du bénéficiaire saisis',
        detail: 'Le nom envoyé pour vérification doit être celui tapé par le PSU, pas une version normalisée ou en cache.',
      },
      2: {
        label: 'acmt.023 demande de vérification',
        detail:
          'Routée via l’annuaire du schéma VoP. Le budget temps est serré car cela s’insère dans le parcours de paiement.',
      },
      3: {
        label: 'acmt.024 rapport',
        detail:
          'Trois issues : match, close match avec le nom correct renvoyé, ou no match. Close match est le cas intéressant — montrez le nom suggéré sans fuiter d’autres données de compte.',
      },
      4: {
        label: 'Résultat affiché au PSU',
        detail:
          'En no-match le PSU doit accepter explicitement le risque. S’il continue, le basculement de responsabilité exige de journaliser ce consentement.',
      },
    },
  },

  'sic-chf-credit': {
    name: 'Crédit client SIC CHF',
    summary:
      'Virement franc suisse de l’initiation client au règlement SIC RTGS en monnaie banque centrale.',
    useCase:
      'Paiements CHF domestiques sous Swiss Payment Standards. Mêmes formes ISO 20022 que le SEPA, ClrSys, devise et contraintes IG différents.',
    steps: {
      1: {
        label: 'pain.001 initiation CHF',
        detail:
          'Swiss Payment Standards client-banque. Données remittance QR-bill si présentes ; Ccy doit être CHF. N’envoyez pas de codes service-level SEPA sur un paiement SIC CHF.',
      },
      2: {
        label: 'pain.002 acceptation',
        detail: 'La banque accepte l’instruction (ACTC) avant le rail. Un rejet ici ne touche jamais SIC.',
      },
      3: {
        label: 'pacs.008 vers SIC',
        detail:
          'Soumis à SIC avec ClrSys du RTGS suisse. Règlement en monnaie BNS ; IntrBkSttlmAmt Ccy=CHF.',
      },
      4: {
        label: 'pacs.002 réception',
        detail: 'SIC accuse réception au participant instructeur avant la fin du règlement.',
      },
      5: {
        label: 'pacs.008 réglé livré',
        detail: 'Après règlement, SIC livre le virement au participant banque créancière.',
      },
      6: {
        label: 'pacs.002 banque créancière',
        detail: 'Le participant récepteur accuse. TxSts ACSC est la confirmation de règlement à rapprocher.',
      },
    },
  },

  'sic-ip-instant': {
    name: 'SIC Instant Payment (SIC IP)',
    summary:
      'Paiement CHF instantané sur le service SIC5 Instant Payments — règlement <10 s avec le même vocabulaire pacs que SCT Inst.',
    useCase:
      'A2A suisse instantané. Timeouts et investigations pacs.028 s’appliquent ; ne traitez pas l’absence de pacs.002 comme un échec sûr.',
    steps: {
      1: {
        label: 'Soumission pacs.008 SIC IP',
        detail:
          'Fonds réservés chez la banque débitrice. La fenêtre SIC IP se compte en secondes, pas en cycles batch.',
      },
      2: {
        label: 'Transmission au participant créancier',
        detail: 'SIC IP route vers la banque réceptrice pour décision de crédit immédiate.',
      },
      3: {
        label: 'pacs.002 ACSC',
        detail: 'La banque créancière accepte et crédite. ACSC clôt le chemin heureux dans le SLA.',
      },
      4: {
        label: 'Statut retour banque débitrice',
        detail: 'La banque débitrice libère la réservation comme réglée (ou l’annule sur RJCT).',
      },
    },
  },

  'sic-ip-timeout': {
    name: 'Timeout SIC IP et enquête',
    summary:
      'Pas de pacs.002 dans la fenêtre SIC IP. Gardez la réservation et enquêtez avec pacs.028 — ne ré-initiez jamais à l’aveugle.',
    useCase: 'Même classe de bug que les timeouts SCT Inst, sur le rail instantané suisse.',
    steps: {
      1: {
        label: 'pacs.008 soumis, chrono démarré',
        detail: 'Réservation posée. L’horloge est le SLA SIC IP, pas le prochain batch SIC.',
      },
      2: {
        label: 'Timeout — pas de réponse',
        detail: 'État ambigu. Ne dites pas au client que c’est échoué ; ne soumettez pas de doublon.',
      },
      3: {
        label: 'pacs.028 demande de statut',
        detail: 'Enquête formelle citant EndToEndId / TxId du pacs.008 d’origine.',
      },
      4: {
        label: 'pacs.002 tardif',
        detail:
          'Souvent ACSC ou RJCT. Si silence après la fenêtre d’investigation, suivez le chemin de rejet du handbook SIC IP.',
      },
    },
  },

  'eurosic-eur-credit': {
    name: 'Jambe de compensation euroSIC EUR',
    summary:
      'Virement EUR compensé via euroSIC pour les participants suisses — pacs ISO 20022 sur le service RTGS euroSIC.',
    useCase:
      'Banques suisses qui font circuler de l’EUR via euroSIC plutôt que STEP2/TARGET. Mêmes types de messages, ClrSys euroSIC et règles de participants.',
    steps: {
      1: {
        label: 'pacs.008 vers euroSIC',
        detail:
          'Ccy=EUR et code système euroSIC. Ne confondez pas avec SIC CHF ou le routage CSM SEPA.',
      },
      2: {
        label: 'pacs.002 réception',
        detail: 'euroSIC accuse réception au participant instructeur.',
      },
      3: {
        label: 'Livraison réglée',
        detail: 'Le participant créancier reçoit le pacs.008 réglé.',
      },
      4: {
        label: 'pacs.002 ACSC',
        detail: 'Règlement confirmé côté réception.',
      },
    },
  },

  'wero-a2a-payment': {
    name: 'Paiement overlay A2A (exemple Wero)',
    summary:
      'Overlay A2A retail : intent wallet, résolution proxy, débit ASPSP, règlement SCT Inst. Wero est l’exemple ; Bizum, Payconiq, iDEAL, BLIK, Swish, Vipps MobilePay et TWINT suivent la même séparation.',
    useCase:
      'Checkout ou P2P où l’UX est gouvernée par EPI Company SE (Wero) mais l’argent circule sur rails instantanés (SCT Inst). Option de routage banque participante directe ou sous-participant.',
    steps: {
      1: {
        label: 'Créer l’intent de paiement Wero',
        detail: 'Montant, alias commerçant/bénéficiaire, URLs de retour. Régi par les règles du schéma EPI Company SE.',
      },
      2: {
        label: 'Résoudre proxy / alias',
        detail:
          'Téléphone ou e-mail → IBAN via l’annuaire Wero. Lancez quand même la VoP si la régulation exige le contrôle de nom.',
      },
      3: {
        label: 'Authentification ASPSP',
        detail:
          'Confirmation in-app ou SCA banque si l’ASPSP l’exige. L’abandon laisse l’intent annulable.',
      },
      4: {
        label: 'pacs.008 SCT Inst',
        detail:
          'La jambe de règlement sous-jacente est SCT Instant (ou instantané national), routée via BIC participant direct ou sous-participant.',
      },
      5: {
        label: 'pacs.002 ACSC',
        detail: 'Confirmation de règlement instantané. Ce n’est qu’alors que Wero doit afficher payé.',
      },
      6: {
        label: 'Statut Wero COMPLETED',
        detail:
          'L’UI wallet se met à jour depuis le statut schéma, qui doit suivre la confirmation de compensation — pas la précéder.',
      },
    },
  },

  'hub-ip-transaction-flow': {
    name: 'Flux de paiement instantané (IP) via Payment Hub & ILM',
    summary:
      'Flux de paiement instantané de bout en bout à travers l’architecture interne : Réseau externe > Passerelle AGI (Access Gateway Interface) > Payment Hub (Finastra/Volante/FIS/Sopra/Maison) > ILM (Gestion de la liquidité intraday) > Core Banking / Moteur de règlement.',
    useCase:
      'Traitement de paiements instantanés à haut débit détaillant les jambes obligatoires de passerelle/hub et la réservation de liquidité ILM optionnelle vs blocage direct Core Banking (T24).',
    steps: {
      1: {
        label: 'Demande pacs.008 INST entrante',
        detail:
          'Le réseau externe (ex. TIPS/RT1/SWIFT) délivre un message pacs.008 entrant avec LclInstrm=INST à l’Access Gateway Interface (AGI).',
      },
      2: {
        label: 'Relais du payload pacs.008 validé',
        detail:
          'AGI valide le schéma XML, les signatures de sécurité et les en-têtes mTLS, puis achemine le message pacs.008 normalisé vers le Payment Hub (Finastra/Volante/FIS/Sopra/Maison).',
      },
      3: {
        label: 'Vérification de liquidité intraday en temps réel (Obligatoire participants directs ; optionnelle pour sous-participants pré-financés)',
        detail:
          'Le Payment Hub demande un contrôle de liquidité intraday instantané et une réservation auprès de l’ILM (Intraday Liquidity Management) afin d’assurer la couverture nécessaire.',
      },
      4: {
        label: 'Liquidité réservée et approuvée',
        detail:
          'L’ILM vérifie les positions intraday actuelles, réserve la liquidité pour la transaction instantanée et renvoie une confirmation au Payment Hub.',
      },
      5: {
        label: 'Blocage Core Banking (T24) & exécution du règlement',
        detail:
          'Le Payment Hub transmet l’instruction pacs.008 au Core Banking System (T24) / Moteur de règlement pour effectuer la réservation de fonds et imputer les écritures comptables.',
      },
      6: {
        label: 'Statut final pacs.002 ACSC',
        detail:
          'Le Moteur de règlement / Core Banking exécute le règlement immédiat et renvoie un rapport de statut pacs.002 avec TxSts=ACSC (Accepted Settlement Completed).',
      },
      7: {
        label: 'Validation de la réservation de liquidité',
        detail:
          'Le Payment Hub informe l’ILM que le règlement est effectué, convertissant la réservation temporaire en une position comptable intraday définitive.',
      },
      8: {
        label: 'Réponse pacs.002 ACSC transmise',
        detail:
          'Le Payment Hub transmet la confirmation positive pacs.002 à l’AGI pour émission sortante.',
      },
      9: {
        label: 'Accusé de réception sortant pacs.002 ACSC',
        detail:
          'AGI délivre la confirmation pacs.002 ACSC via le réseau externe vers la partie instructrice dans le respect du SLA instantané.',
      },
    },
  },

  'hub-non-ip-transaction-flow': {
    name: 'Flux de paiement non instantané (Batch standard) via Payment Hub & ILM',
    summary:
      'Flux de paiement non instantané (batch standard / virement) de bout en bout à travers l’architecture interne : Réseau externe > AGI > Payment Hub > ILM > Core Banking (T24) / Moteur de règlement.',
    useCase:
      'Traitement de paiements standard détaillant les jambes de routage obligatoires et l’option de compensation via Sous-Participant vs directe.',
    steps: {
      1: {
        label: 'Virement standard pacs.008 entrant',
        detail:
          'Le réseau externe (STEP2 / SWIFT / CSM) délivre un virement batch ou standard pacs.008 à l’Access Gateway Interface (AGI).',
      },
      2: {
        label: 'Relais du payload pacs.008 validé',
        detail:
          'AGI valide la conformité XML et les règles de schéma, puis transmet l’instruction au Payment Hub (Finastra/Volante/FIS/Sopra/Maison).',
      },
      3: {
        label: 'Vérification des limites et mise en file d’attente (Optionnelle pour sous-participants pré-financés ; obligatoire pour membres compensateurs directs)',
        detail:
          'Le Payment Hub contrôle les limites de liquidité intraday avec l’ILM. S’agissant d’un paiement non instantané, si la liquidité est tendue, la transaction est mise en attente pour la prochaine fenêtre de cutoff plutôt que rejetée immédiatement.',
      },
      4: {
        label: 'Allocation de liquidité au cutoff batch',
        detail:
          'Lors de la fenêtre de règlement intraday programmée, l’ILM alloue la liquidité intraday requise pour le lot et notifie le Payment Hub.',
      },
      5: {
        label: 'Soumission du règlement batch & comptabilisation Core Banking',
        detail:
          'Le Payment Hub soumet les instructions pacs.008 accumulées au Moteur de règlement / Core Banking System (T24) pour écriture comptable.',
      },
      6: {
        label: 'Confirmation batch pacs.002 ACSC',
        detail:
          'Le Moteur de règlement exécute la comptabilisation batch et renvoie un rapport pacs.002 indiquant ACSC (Accepted Settlement Completed).',
      },
      7: {
        label: 'Mise à jour de la position de liquidité intraday',
        detail:
          'Le Payment Hub transmet les détails finaux du règlement à l’ILM pour mettre à jour le grand livre de liquidité intraday et libérer les réserves.',
      },
      8: {
        label: 'Réponse pacs.002 ACSC transmise',
        detail:
          'Le Payment Hub renvoie le rapport de confirmation pacs.002 à l’AGI.',
      },
      9: {
        label: 'Délivrance du pacs.002 ACSC sortant',
        detail:
          'AGI transmet le rapport final pacs.002 ACSC sur le réseau externe pour achever le cycle de vie du paiement non instantané.',
      },
    },
  },

  'bg-payment-cancellation': {
    name: 'Annulation de paiement avant règlement',
    summary:
      'Le TPP annule un paiement encore annulable ; l’ASPSP mappe DELETE vers camt.055 et renvoie un statut terminal.',
    useCase:
      'L’utilisateur abandonne le checkout après initiation. Après règlement il faut un rappel (camt.056), pas un DELETE.',
    steps: {
      1: {
        label: 'L’utilisateur annule le checkout',
        detail:
          'Sûr seulement tant que le statut est RCVD / PDNG / ACTC. ACSP/ACSC signifie que l’argent bouge déjà ou est parti.',
      },
      2: {
        label: 'DELETE de la ressource paiement',
        detail:
          'Annulation Berlin Group. Certaines banques renvoient 204, d’autres 202 avec une ressource d’annulation. CANCULATION_INVALID si déjà exécuté.',
      },
      3: {
        label: 'camt.055 si encore pré-compensation',
        detail:
          'Demande d’annulation client vers le moteur de paiement de la banque. Si déjà soumis au CSM, cela devient un rappel.',
      },
      4: {
        label: 'Statut CANC',
        detail:
          'Annulé terminal. Ne réutilisez pas le même EndToEndId pour une nouvelle initiation sans nouvel id.',
      },
    },
  },
};
