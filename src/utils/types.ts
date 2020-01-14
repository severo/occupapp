// Images
export interface ImageSrc {
    src: string;
    srcset?: string;
    thumbnailSrc?: string;
    localId?: string;
}

// Points
export interface XY {
  x: number;
  y: number;
}
export interface XYId extends XY {
  id: string;
}
export interface XYCategory extends XY {
  categoryId?: string;
}
export interface Point extends XYCategory {
  id: string;
  number: number;
}

// Categories
export interface Color {
  color: string;
}
export interface Category extends Color {
  id: string;
}

// Compositions
export interface Composition {
  backgroundImage: ImageSrc;
  points: Point[];
  categories: Category[];
}
