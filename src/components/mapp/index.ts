import { IconType } from 'react-icons';

export interface Provision {
  text: string;
}

export interface LaborRight {
  id: number;
  title: string;
  details: string;
  reference: string;
  provisions: Provision[];
}

export interface Category {
  id: number;
  category: string;
  icon: IconType;
  color: string;
  rights: LaborRight[];
}

export interface AppStats {
  categories: number;
  rights: number;
  sections: number;
}

export interface SearchState {
  query: string;
  expandedCategory: number | null;
  expandedRight: number | null;
}