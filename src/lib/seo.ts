import { paymentById } from '@/data/payments';
import { flowById } from '@/data/flows';
import { messageByShort } from '@/data/iso20022';
import { sampleById } from '@/data/samples';
import { standardById } from '@/data/standards';
import { infrastructureById } from '@/data/infrastructures';
import { SITE_ORIGIN } from '@/lib/prerenderUrls';

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
};

const DEFAULT: PageSeo = {
  title: 'OpenFinance — Payment Explorer',
  description:
    'Explore European payment flows, ISO 20022 messages, SEPA schemes and infrastructures. Understand every actor, system, message and standard involved.',
  canonicalPath: '/',
};

function clip(text: string, max = 160): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

/** English SEO metadata for a catalog (or legal) path. */
export function pageSeo(pathname: string): PageSeo {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') return { ...DEFAULT, canonicalPath: '/' };
  if (path === '/about') {
    return {
      title: 'About — OpenFinance',
      description: clip(
        'OpenFinance is an educational catalog of European payment flows, ISO 20022 messages and Open Banking standards, published by GeoKing.',
      ),
      canonicalPath: path,
    };
  }
  if (path === '/privacy') {
    return {
      title: 'Privacy — OpenFinance',
      description: clip('How OpenFinance and GeoKing use AdSense, cookies and publisher data on this catalog.'),
      canonicalPath: path,
    };
  }
  if (path === '/contact') {
    return {
      title: 'Contact — OpenFinance',
      description: clip('Contact the publisher of OpenFinance (GeoKing) about this payment catalog.'),
      canonicalPath: path,
    };
  }
  if (path === '/glossary') {
    return {
      title: 'Payments glossary — OpenFinance',
      description: clip(
        'Glossary of PSD2, Open Finance, ISO 20022 and scheme terms used across European payment rails.',
      ),
      canonicalPath: path,
    };
  }

  const paymentMatch = path.match(/^\/payment\/([^/]+)$/);
  if (paymentMatch) {
    const payment = paymentById(paymentMatch[1]);
    if (payment) {
      return {
        title: `${payment.name.en} — Payment Explorer`,
        description: clip(payment.summary.en),
        canonicalPath: path,
      };
    }
  }

  const flowMatch = path.match(/^\/flows\/([^/]+)$/);
  if (flowMatch) {
    const flow = flowById(flowMatch[1]);
    if (flow) {
      return {
        title: `${flow.name} — OpenFinance`,
        description: clip(flow.summary),
        canonicalPath: path,
      };
    }
  }

  const messageMatch = path.match(/^\/messages\/([^/]+)$/);
  if (messageMatch) {
    const message = messageByShort(messageMatch[1]);
    if (message) {
      return {
        title: `${message.short} — OpenFinance`,
        description: clip(message.purpose),
        canonicalPath: path,
      };
    }
  }

  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (compareMatch) {
    const message = messageByShort(compareMatch[1]);
    if (message) {
      return {
        title: `${message.short} versions — OpenFinance`,
        description: clip(`Compare ISO 20022 namespace versions for ${message.short} (${message.name}).`),
        canonicalPath: path,
      };
    }
  }

  const sampleMatch = path.match(/^\/samples\/([^/]+)$/);
  if (sampleMatch) {
    const sample = sampleById(sampleMatch[1]);
    if (sample) {
      return {
        title: `${sample.label} — OpenFinance`,
        description: clip(sample.description),
        canonicalPath: path,
      };
    }
  }

  const standardMatch = path.match(/^\/standards\/([^/]+)$/);
  if (standardMatch) {
    const standard = standardById(standardMatch[1]);
    if (standard) {
      return {
        title: `${standard.name} — OpenFinance`,
        description: clip(standard.summary),
        canonicalPath: path,
      };
    }
  }

  const infraMatch = path.match(/^\/infrastructure\/([^/]+)$/);
  if (infraMatch) {
    const infra = infrastructureById(infraMatch[1]);
    if (infra) {
      return {
        title: `${infra.name.en} — OpenFinance`,
        description: clip(infra.summary.en),
        canonicalPath: path,
      };
    }
  }

  return { ...DEFAULT, canonicalPath: path };
}

export function canonicalUrl(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}
