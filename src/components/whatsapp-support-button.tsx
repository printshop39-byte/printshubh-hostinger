/**
 * WhatsAppSupportButton — intentionally renders nothing.
 *
 * The floating round desktop button was retired in the global visual
 * refresh: it floated over content and duplicated the WhatsApp actions that
 * every section already carries, plus the mobile bottom bar. The component
 * (and its `hideNear` prop) is kept as a no-op so the existing import sites
 * need no change; delete those sites and this file together if desired.
 */

export function WhatsAppSupportButton(props: { hideNear?: string[] }) {
  void props;
  return null;
}
