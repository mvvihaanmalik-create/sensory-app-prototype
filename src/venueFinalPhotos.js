import p0101 from './assets/venue-final/01-01-venue-carousel-photo-1.jpg';
import p0102 from './assets/venue-final/01-02-venue-carousel-photo-2.jpg';
import p0103 from './assets/venue-final/01-03-venue-carousel-photo-3.jpg';
import p0104 from './assets/venue-final/01-04-venue-carousel-photo-4.jpg';
import p0105 from './assets/venue-final/01-05-venue-carousel-photo-5.jpg';
import p0201 from './assets/venue-final/02-01-venue-menu-photo-1.jpg';
import p0202 from './assets/venue-final/02-02-venue-menu-photo-2.jpg';
import p0203 from './assets/venue-final/02-03-venue-menu-photo-3.jpg';
import p0204 from './assets/venue-final/02-04-venue-menu-photo-4.jpg';
import p0205 from './assets/venue-final/02-05-venue-highlight-photo-1.jpg';
import p0206 from './assets/venue-final/02-06-venue-highlight-photo-2.jpg';
import p0207 from './assets/venue-final/02-07-venue-highlight-photo-3.jpg';
import p0208 from './assets/venue-final/02-08-venue-highlight-photo-4.jpg';
import p0209 from './assets/venue-final/02-09-venue-highlight-photo-5.jpg';
import p0301 from './assets/venue-final/03-01-photos-tab-col-1-photo-1.jpg';
import p0302 from './assets/venue-final/03-02-photos-tab-col-1-photo-2.jpg';
import p0303 from './assets/venue-final/03-03-photos-tab-col-1-photo-3.jpg';
import p0304 from './assets/venue-final/03-04-photos-tab-col-1-photo-4.jpg';
import p0305 from './assets/venue-final/03-05-photos-tab-col-2-photo-1.jpg';
import p0306 from './assets/venue-final/03-06-photos-tab-col-2-photo-2.jpg';
import p0307 from './assets/venue-final/03-07-photos-tab-col-2-photo-3.jpg';
import p0308 from './assets/venue-final/03-08-photos-tab-col-2-photo-4.jpg';
export const CAROUSEL = [p0101, p0102, p0103, p0104, p0105];
export const MENU = [p0201, p0202, p0203, p0204];
export const HIGHLIGHT_PHOTOS = [p0205, p0206, p0207, p0208, p0209];
export const PHOTO_GRID = [[p0301, p0302, p0303, p0304], [p0305, p0306, p0307, p0308]];
// Normalized image crop transforms from the matching Final flow slots.
export const MENU_CROPS = [[.6659834385,.6291641593,.1465773284,.1548130065],[.8666666746,.5643777251,.0697674453,.2110157460],[.8403100967,.5171673894,.0985174030,.2314818203],[.8403100967,.5171673298,.0837209299,.2389127314]];
export const GRID_CROPS = [[[1,.6151645184,0,.1924177408],[.6976743937,.5715308189,.1173276752,.2169778943],[.6600133181,.5414921045,.1362453103,.2045026571],[.8480619788,.5865522027,.0597742572,.2022336721]],[[1,.6151645184,0,.1924177408],null,null,[1,.6151645184,0,.1924177408]]];
export function photoBackground(src, crop) {
 if (!crop) return { background: `#dbdbde url(${src}) center / cover` };
 const [a,d,x,y] = crop;
 return { backgroundColor: '#dbdbde', backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat', backgroundSize: `${100/a}% ${100/d}%`, backgroundPosition: `${a===1?50:100*x/(1-a)}% ${d===1?50:100*y/(1-d)}%` };
}
