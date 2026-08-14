import { g, type GlossaryEntry } from './glossaryTypes';

/** Mastercard Open Finance US glossary — product vocabulary, not EU PSD2. */
export const GLOSSARY_MASTERCARD: GlossaryEntry[] = [
  g(
    'access-token',
    'Access token',
    'concept',
    { en: 'Access token (Mastercard Open Finance)', fr: 'Jeton d’accès (Mastercard Open Finance)' },
    {
      en: 'After Partner ID and Partner Secret are authenticated, Mastercard returns an access token (valid two hours; rotate after ~90 minutes). Required on every Open Finance US API call. Distinct from PSD2 XS2A access tokens.',
      fr: 'Après authentification Partner ID / Partner Secret, Mastercard renvoie un jeton d’accès (valable deux heures ; à renouveler vers 90 minutes). Requis sur chaque appel Open Finance US. Distinct des jetons XS2A PSD2.',
    },
    {
      aliases: {
        en: ['access token', 'Partner Authentication token'],
        fr: ['jeton d’accès', 'access token'],
      },
      seeAlso: ['partner', 'app-key', 'oauth2', 'sandbox'],
      sources: ['mastercard'],
      links: [
        {
          label: 'Mastercard: Authentication',
          href: 'https://developer.mastercard.com/open-finance-us/documentation/onboarding/#authentication',
        },
      ],
    },
  ),
  g(
    'account-aggregation',
    'Account aggregation',
    'concept',
    { en: 'Account aggregation', fr: 'Agrégation de comptes' },
    {
      en: 'Gathering a customer’s account data in real time after they permission accounts in Data Connect. Records refresh daily; TxPUSH can notify an event listener of account changes. Closest EU analogue is AIS.',
      fr: 'Collecte en temps réel des données de comptes après permissionnement dans Data Connect. Rafraîchissement quotidien ; TxPUSH peut notifier les changements. L’analogue UE est l’AIS.',
    },
    {
      aliases: {
        en: ['account aggregation', 'TxPUSH'],
        fr: ['agrégation de comptes', 'TxPUSH'],
      },
      seeAlso: ['ais', 'data-connect', 'permissioning', 'aisp'],
      sources: ['mastercard'],
      links: [
        {
          label: 'Mastercard: Account Aggregation',
          href: 'https://developer.mastercard.com/open-finance-us/documentation/products/manage/account-aggregation/',
        },
      ],
    },
  ),
  g(
    'account-id',
    'Account ID',
    'concept',
    { en: 'Account ID (Mastercard)', fr: 'Account ID (Mastercard)' },
    {
      en: 'Mastercard identifier for one financial account owned by a customer ID (checking, savings, money market, …). Data hangs off the customer ID until the account is removed.',
      fr: 'Identifiant Mastercard d’un compte financier rattaché à un customer ID (courant, épargne, money market…). Les données restent liées au customer ID jusqu’à suppression du compte.',
    },
    {
      aliases: { en: ['accountId', 'account ID'], fr: ['accountId', 'identifiant de compte'] },
      seeAlso: ['customer', 'consumer'],
      sources: ['mastercard'],
    },
  ),
  g(
    'applications',
    'Applications',
    'concept',
    { en: 'Partner applications (Mastercard)', fr: 'Applications partenaire (Mastercard)' },
    {
      en: 'Web or mobile apps built by Mastercard Open Finance partners. Each must be registered so customers see the app name and logo in Data Connect.',
      fr: 'Apps web ou mobiles des partenaires Mastercard Open Finance. Chacune doit être enregistrée pour que le client voie nom et logo dans Data Connect.',
    },
    {
      aliases: { en: ['partner applications', 'Data Connect application'], fr: ['applications partenaire'] },
      seeAlso: ['data-connect', 'app-registration', 'partner'],
      sources: ['mastercard'],
      links: [
        {
          label: 'Mastercard: Data Connect',
          href: 'https://developer.mastercard.com/open-finance-us/documentation/connect/',
        },
      ],
    },
  ),
  g(
    'app-key',
    'App-Key',
    'concept',
    { en: 'App Key (Finicity-App-Key)', fr: 'App Key (Finicity-App-Key)' },
    {
      en: 'Header credential issued with Partner ID and Partner Secret when you create a Mastercard Developers project. Required on every Open Finance US data call. Legacy name: Finicity-App-Key.',
      fr: 'Identifiant d’en-tête délivré avec Partner ID et Partner Secret à la création d’un projet Mastercard Developers. Requis sur chaque appel de données Open Finance US. Ancien nom : Finicity-App-Key.',
    },
    {
      aliases: {
        en: ['Finicity-App-Key', 'App Key', 'App-Key'],
        fr: ['Finicity-App-Key', 'App Key', 'App-Key'],
      },
      seeAlso: ['partner', 'access-token', 'sandbox'],
      sources: ['mastercard'],
    },
  ),
  g(
    'app-registration',
    'App registration',
    'concept',
    { en: 'App registration (OAuth)', fr: 'Enregistrement d’application (OAuth)' },
    {
      en: 'Mastercard partners register apps to reach financial institutions over OAuth. Multiple apps can be assigned to a client via Set Customer App ID so they share OAuth FI connections.',
      fr: 'Les partenaires Mastercard enregistrent leurs apps pour joindre les établissements via OAuth. Plusieurs apps peuvent être rattachées à un client (Set Customer App ID) pour partager les connexions OAuth.',
    },
    {
      aliases: { en: ['OAuth app registration', 'Set Customer App ID'], fr: ['enregistrement OAuth', 'Set Customer App ID'] },
      seeAlso: ['oauth2', 'applications', 'partner'],
      sources: ['mastercard'],
    },
  ),
  g(
    'certified-institutions',
    'Certified FI',
    'concept',
    { en: 'Certified institutions', fr: 'Établissements certifiés' },
    {
      en: 'US financial institutions certified for Mastercard Open Finance connectivity and product coverage (Account Balance, Verification of Income, …). Unsupported products block related APIs.',
      fr: 'Établissements US certifiés pour la connectivité Mastercard Open Finance et la couverture produit (solde, VOI…). Un produit non supporté bloque les API associées.',
    },
    {
      aliases: {
        en: ['Certified Institutions', 'Certified FI', 'VOI'],
        fr: ['établissements certifiés', 'FI certifiées', 'VOI'],
      },
      seeAlso: ['voi', 'finbanks'],
      sources: ['mastercard'],
    },
  ),
  g(
    'consumer',
    'Consumer',
    'concept',
    { en: 'Consumer (FCRA record)', fr: 'Consumer (enregistrement FCRA)' },
    {
      en: 'Mastercard FCRA reporting record tied to a customer ID. The consumer remains owner of generated reports even after the customer ID is deleted, so disputes can still be filed.',
      fr: 'Enregistrement FCRA Mastercard lié à un customer ID. Le consumer reste propriétaire des rapports même après suppression du customer ID, pour permettre les contestations.',
    },
    {
      aliases: { en: ['consumer ID', 'FCRA consumer'], fr: ['consumer ID', 'consommateur FCRA'] },
      seeAlso: ['customer', 'fcra', 'mvs'],
      sources: ['mastercard'],
    },
  ),
  g(
    'customer',
    'Customer',
    'concept',
    { en: 'Customer (Mastercard Open Finance)', fr: 'Customer (Mastercard Open Finance)' },
    {
      en: 'End user who grants Mastercard Open Finance access to their accounts via Data Connect or MVS and permissions what to share. All financial data hangs off a unique customer ID. Not the same as a PSD2 PSU in legal terms, but the same human in the journey.',
      fr: 'Utilisateur final qui accorde l’accès Mastercard Open Finance via Data Connect ou MVS et permissionne le partage. Toutes les données tiennent à un customer ID. Pas le PSU PSD2 au sens juridique, mais la même personne dans le parcours.',
    },
    {
      aliases: { en: ['customer ID', 'end user'], fr: ['customer ID', 'utilisateur final'] },
      seeAlso: ['psu', 'permissioning', 'data-connect', 'consumer'],
      sources: ['mastercard'],
    },
  ),
  g(
    'customer-id-testing',
    'Test customer ID',
    'concept',
    { en: 'Customer ID, testing', fr: 'Customer ID de test' },
    {
      en: 'Test customer that can only read FinBanks via test profiles — live Open Finance APIs, fake institutions — before production customer IDs.',
      fr: 'Customer de test qui ne lit que FinBanks via les profils de test — APIs Open Finance réelles, établissements fictifs — avant les customer ID de production.',
    },
    {
      aliases: { en: ['testing customer ID', 'test customer'], fr: ['customer de test', 'testing customer ID'] },
      seeAlso: ['finbanks', 'test-profiles', 'sandbox', 'test-drive'],
      sources: ['mastercard'],
    },
  ),
  g(
    'data-connect',
    'Data Connect',
    'concept',
    { en: 'Data Connect', fr: 'Data Connect' },
    {
      en: 'Mastercard UI you embed so customers connect to their FIs and permission accounts. After that, Open Finance APIs can read the consented data. US counterpart to an AIS consent / bank-selection screen.',
      fr: 'UI Mastercard à embarquer pour que le client connecte ses établissements et permissionne les comptes. Ensuite les API Open Finance lisent les données consenties. Équivalent US de l’écran de consentement AIS.',
    },
    {
      aliases: { en: ['Data Connect app', 'DataConnect'], fr: ['application Data Connect', 'DataConnect'] },
      seeAlso: ['permissioning', 'consent', 'ais', 'data-connect-events', 'data-connect-session'],
      sources: ['mastercard'],
      links: [
        {
          label: 'Mastercard: Data Connect',
          href: 'https://developer.mastercard.com/open-finance-us/documentation/connect/',
        },
      ],
    },
  ),
  g(
    'data-connect-events',
    'Data Connect Events',
    'concept',
    { en: 'Data Connect Events', fr: 'Événements Data Connect' },
    {
      en: 'SDK notifications (web/mobile) for Data Connect: app loaded/canceled/completed, user actions, and route changes while the customer navigates the connect UI.',
      fr: 'Notifications SDK (web/mobile) pour Data Connect : app chargée/annulée/terminée, actions utilisateur et changements de route pendant le parcours.',
    },
    {
      aliases: {
        en: ['Web SDK Events', 'User Events', 'Route Events'],
        fr: ['Web SDK Events', 'User Events', 'Route Events'],
      },
      seeAlso: ['data-connect', 'data-connect-session'],
      sources: ['mastercard'],
    },
  ),
  g(
    'data-connect-experience',
    'Data Connect Experience',
    'concept',
    { en: 'Data Connect Experience', fr: 'Expérience Data Connect' },
    {
      en: 'Branding and behaviour pack for the Data Connect app. The `experience` parameter on Generate Data Connect URL loads the configured look when the session starts.',
      fr: 'Pack d’apparence et de comportement de Data Connect. Le paramètre `experience` de Generate Data Connect URL charge le look configuré au démarrage de la session.',
    },
    {
      aliases: { en: ['experience parameter', 'Connect experience'], fr: ['paramètre experience', 'expérience Connect'] },
      seeAlso: ['data-connect'],
      sources: ['mastercard'],
    },
  ),
  g(
    'data-connect-session',
    'Data Connect Session',
    'concept',
    { en: 'Data Connect Session', fr: 'Session Data Connect' },
    {
      en: 'One customer opening of Data Connect (mobile or browser) through FI connection and permissioning. Ends when the customer submits. Monitor with Data Connect Events.',
      fr: 'Une ouverture de Data Connect (mobile ou navigateur) jusqu’à la connexion établissement et au permissionnement. Se termine à la soumission. À suivre via Data Connect Events.',
    },
    {
      aliases: { en: ['Connect session'], fr: ['session Connect'] },
      seeAlso: ['data-connect', 'data-connect-events', 'permissioning'],
      sources: ['mastercard'],
    },
  ),
  g(
    'finbanks',
    'FinBanks',
    'concept',
    { en: 'FinBanks', fr: 'FinBanks' },
    {
      en: 'Mastercard mock banks for test customer IDs. Simulate live-FI data (new transactions appear daily). Real customer IDs at live institutions need a paid plan.',
      fr: 'Banques fictives Mastercard pour les customer ID de test. Simulent des données d’établissement réel (nouvelles transactions quotidiennes). Les vrais customer ID exigent une offre payante.',
    },
    {
      aliases: { en: ['FinBanks', 'mock banks', 'test FIs'], fr: ['FinBanks', 'banques fictives'] },
      seeAlso: ['sandbox', 'test-profiles', 'customer-id-testing', 'test-drive'],
      sources: ['mastercard'],
    },
  ),
  g(
    'gse',
    'GSE',
    'concept',
    { en: 'Government-Sponsored Enterprise', fr: 'Entreprise sponsorisée par le gouvernement (GSE)' },
    {
      en: 'US agencies such as Fannie Mae and Freddie Mac. Mastercard Mortgage Verification Services sends borrower reports into LPA/DU using `portfolioID-version-port`.',
      fr: 'Agences US telles que Fannie Mae et Freddie Mac. Mastercard Mortgage Verification Services envoie les rapports emprunteur vers LPA/DU via `portfolioID-version-port`.',
    },
    {
      aliases: {
        en: ['Fannie Mae', 'Freddie Mac', 'LPA', 'DU', 'Loan Product Advisor', 'Desktop Underwriter'],
        fr: ['Fannie Mae', 'Freddie Mac', 'LPA', 'DU'],
      },
      seeAlso: ['mvs', 'consumer'],
      sources: ['mastercard'],
    },
  ),
  g(
    'partner',
    'Partner',
    'concept',
    { en: 'Partner (Mastercard Developers)', fr: 'Partenaire (Mastercard Developers)' },
    {
      en: 'Company or person with a Mastercard Developers account and at least one Open Finance project. Each project gets Partner ID, Partner Secret and App Key.',
      fr: 'Société ou personne titulaire d’un compte Mastercard Developers et d’au moins un projet Open Finance. Chaque projet reçoit Partner ID, Partner Secret et App Key.',
    },
    {
      aliases: { en: ['Partner ID', 'Partner Secret'], fr: ['Partner ID', 'Partner Secret', 'partenaire'] },
      seeAlso: ['app-key', 'access-token', 'partner-linked'],
      sources: ['mastercard'],
    },
  ),
  g(
    'partner-linked',
    'Partner Linked',
    'concept',
    { en: 'Partner Linked access', fr: 'Accès Partner Linked' },
    {
      en: 'Time-boxed third-party access to consented Mastercard Open Finance data via a consent receipt token — e.g. a processor fetching ACH routing to pay on the customer’s behalf.',
      fr: 'Accès tiers limité dans le temps aux données consenties Mastercard Open Finance via un jeton de reçu de consentement — ex. un processeur qui lit le routage ACH pour payer pour le client.',
    },
    {
      aliases: { en: ['Partner Linked', 'consent receipt token'], fr: ['Partner Linked', 'jeton de reçu de consentement'] },
      seeAlso: ['permissioning', 'partner', 'ach', 'tpp'],
      sources: ['mastercard'],
    },
  ),
  g(
    'permissioning',
    'Permissioning',
    'concept',
    { en: 'Permissioning', fr: 'Permissionnement' },
    {
      en: 'US Open Finance consent step: the customer connects FIs in Data Connect or MVS and selects checking/savings/other accounts to share. Closest EU term is consent (PSD2/FiDA).',
      fr: 'Étape de consentement Open Finance US : le client connecte ses établissements dans Data Connect ou MVS et choisit les comptes à partager. Terme UE le plus proche : consentement (PSD2/FiDA).',
    },
    {
      aliases: { en: ['permission accounts', 'account permissioning'], fr: ['permissionnement', 'partage de comptes'] },
      seeAlso: ['consent', 'data-connect', 'mvs', 'ais'],
      sources: ['mastercard'],
    },
  ),
  g(
    'sandbox',
    'Sandbox',
    'concept',
    { en: 'Sandbox (Mastercard Open Finance)', fr: 'Sandbox (Mastercard Open Finance)' },
    {
      en: 'Mastercard project environment with FinBanks and test profiles. You can call live Open Finance APIs against mock institutions before production.',
      fr: 'Environnement de projet Mastercard avec FinBanks et profils de test. Les API Open Finance réelles visent des établissements fictifs avant la production.',
    },
    {
      aliases: { en: ['sandbox environment', 'Open Finance sandbox'], fr: ['environnement sandbox', 'sandbox Open Finance'] },
      seeAlso: ['finbanks', 'test-drive', 'test-profiles', 'directory'],
      sources: ['mastercard', 'ukob'],
    },
  ),
  g(
    'test-drive',
    'Test Drive',
    'concept',
    { en: 'Test Drive plan', fr: 'Offre Test Drive' },
    {
      en: 'Default free Mastercard Developers plan in sandbox: all Open Finance APIs against a testing customer ID. Live FIs require a paid plan.',
      fr: 'Offre gratuite par défaut Mastercard Developers en sandbox : toutes les API Open Finance sur un customer ID de test. Les établissements réels exigent une offre payante.',
    },
    {
      aliases: { en: ['Test Drive', 'free sandbox plan'], fr: ['Test Drive', 'offre sandbox gratuite'] },
      seeAlso: ['sandbox', 'customer-id-testing', 'finbanks'],
      sources: ['mastercard'],
    },
  ),
  g(
    'test-profiles',
    'Test Profiles',
    'concept',
    { en: 'Test Profiles', fr: 'Profils de test' },
    {
      en: 'Mastercard canned scenarios for FinBanks sign-in, accounts, OAuth, payroll/paystubs and MVS, used against live Open Finance APIs with a test customer.',
      fr: 'Scénarios Mastercard prêts à l’emploi pour connexion FinBanks, comptes, OAuth, paie/bulletins et MVS, sur les API Open Finance réelles avec un customer de test.',
    },
    {
      aliases: { en: ['test profiles', 'testing profiles'], fr: ['profils de test'] },
      seeAlso: ['finbanks', 'mvs', 'customer-id-testing'],
      sources: ['mastercard'],
    },
  ),
  g(
    'voi',
    'VOI',
    'concept',
    { en: 'Verification of Income', fr: 'Vérification de revenus' },
    {
      en: 'Mastercard Open Finance product that certifies whether an FI can supply income evidence. If the FI does not support VOI, related APIs are blocked.',
      fr: 'Produit Mastercard Open Finance qui certifie si un établissement peut fournir des preuves de revenus. Sans support VOI, les API associées sont bloquées.',
    },
    {
      aliases: { en: ['Verification of Income', 'income verification'], fr: ['vérification de revenus', 'VOI'] },
      seeAlso: ['certified-institutions', 'mvs'],
      sources: ['mastercard'],
    },
  ),
  g(
    'mvs',
    'MVS',
    'concept',
    { en: 'Mortgage Verification Service', fr: 'Mortgage Verification Service' },
    {
      en: 'Mastercard apps (Income, Payroll, Paystub) that collect borrower data for GSE submissions. Consumers permission accounts here much as they do in Data Connect.',
      fr: 'Apps Mastercard (Income, Payroll, Paystub) qui collectent les données emprunteur pour les GSE. Le permissionnement des comptes y ressemble à Data Connect.',
    },
    {
      aliases: {
        en: ['Mortgage Verification Services', 'MVS apps'],
        fr: ['Mortgage Verification Services', 'apps MVS'],
      },
      seeAlso: ['gse', 'permissioning', 'data-connect', 'voi'],
      sources: ['mastercard'],
    },
  ),
  g(
    'fcra',
    'FCRA',
    'regulation',
    { en: 'Fair Credit Reporting Act', fr: 'Fair Credit Reporting Act' },
    {
      en: 'US consumer-reporting law. Mastercard acts as an FCRA reporting agency, which is why Open Finance US keeps a Consumer record behind each Customer ID for report disputes.',
      fr: 'Loi US sur les rapports de crédit. Mastercard est une agence FCRA, d’où l’enregistrement Consumer derrière chaque Customer ID pour les contestations de rapports.',
    },
    {
      aliases: { en: ['Fair Credit Reporting Act', 'FCRA reporting agency'], fr: ['Fair Credit Reporting Act'] },
      seeAlso: ['consumer', 'customer'],
      sources: ['mastercard'],
    },
  ),
];
