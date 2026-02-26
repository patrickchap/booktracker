import { LucideIconData } from 'lucide-angular';
import { Library, Search, Users } from 'lucide-angular';

export interface NavItem {
  label: string;
  route: string;
  exact: boolean;
  icon: LucideIconData;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'My Library',
    route: '/library',
    exact: false,
    icon: Library,
  },
  {
    label: 'Search',
    route: '/search',
    exact: false,
    icon: Search,
  },
  {
    label: 'Book Clubs',
    route: '/clubs',
    exact: false,
    icon: Users,
  }
];
