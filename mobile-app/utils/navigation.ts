import { Href, router } from 'expo-router';

export function goBackOr(fallback: Href = '/home' as Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
