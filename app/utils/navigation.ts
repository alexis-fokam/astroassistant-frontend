import { APP_MODULES, type AppModule, type NavItem } from '~/constants/navigation'

export function moduleForPath(path: string): AppModule {
  return APP_MODULES.find((m) => path === m.to || path.startsWith(`${m.to}/`)) ?? APP_MODULES[0]!
}

export function isNavItemActive(item: NavItem, path: string): boolean {
  if (path === item.to) return true
  const prefixes = item.match === undefined ? [] : Array.isArray(item.match) ? item.match : [item.match]
  return prefixes.some((prefix) => path.startsWith(prefix))
}
