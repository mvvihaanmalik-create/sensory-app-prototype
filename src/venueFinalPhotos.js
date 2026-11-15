import p0101 from './assets/venue-final/01-01-venue-carousel-photo-1.jpg';
import p0102 from './assets/venue-final/01-02-venue-carousel-photo-2.jpg';
import p0103 from './assets/venue-final/01-03-venue-carousel-photo-3.jpg';
import p0104 from './assets/venue-final/01-04-venue-carousel-photo-4.jpg';
import p0105 from './assets/venue-final/01-05-venue-carousel-photo-5.jpg';
import p0201 from './assets/venue-final/02-01-venue-menu-photo-1.svg';
import p0202 from './assets/venue-final/02-02-venue-menu-photo-2.svg';
import p0203 from './assets/venue-final/02-03-venue-menu-photo-3.svg';
import p0204 from './assets/venue-final/02-04-venue-menu-photo-4.svg';
import p0205 from './assets/venue-final/02-05-venue-highlight-photo-1.jpg';
import p0206 from './assets/venue-final/02-06-venue-highlight-photo-2.jpg';
import p0207 from './assets/venue-final/02-07-venue-highlight-photo-3.jpg';
import p0208 from './assets/venue-final/02-08-venue-highlight-photo-4.jpg';
import p0209 from './assets/venue-final/02-09-venue-highlight-photo-5.jpg';
import p0301 from './assets/venue-final/03-01-photos-tab-col-1-photo-1.svg';
import p0302 from './assets/venue-final/03-02-photos-tab-col-1-photo-2.svg';
import p0303 from './assets/venue-final/03-03-photos-tab-col-1-photo-3.svg';
import p0304 from './assets/venue-final/03-04-photos-tab-col-1-photo-4.svg';
import p0305 from './assets/venue-final/03-05-photos-tab-col-2-photo-1.svg';
import p0306 from './assets/venue-final/03-06-photos-tab-col-2-photo-2.jpg';
import p0307 from './assets/venue-final/03-07-photos-tab-col-2-photo-3.jpg';
import p0308 from './assets/venue-final/03-08-photos-tab-col-2-photo-4.svg';
export const CAROUSEL = [p0101, p0102, p0103, p0104, p0105];
export const MENU = [p0201, p0202, p0203, p0204];
export const HIGHLIGHT_PHOTOS = [p0205, p0206, p0207, p0208, p0209];
export const PHOTO_GRID = [[p0301, p0302, p0303, p0304], [p0305, p0306, p0307, p0308]];
// Normalized image crop transforms from the matching Final flow slots.
export const MENU_CROPS = [null, null, null, null];
export const GRID_CROPS = [[null,null,null,null],[null,null,null,null]];
export function photoBackground(src, crop) {
 if (!crop) return { background: `#dbdbde url(${src}) center / cover` };
 const [a,d,x,y] = crop;
 return { backgroundColor: '#dbdbde', backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat', backgroundSize: `${100/a}% ${100/d}%`, backgroundPosition: `${a===1?50:100*x/(1-a)}% ${d===1?50:100*y/(1-d)}%` };
}
