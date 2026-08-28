// Real brand assets
export const ASSET = {
  classroomGroup: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/6upjfswb_image.png",
  award1: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/5bth80qb_image.png",
  award2: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/9vlwzrrd_image.png",
  groupPhoto: "https://customer-assets-4nw71qhi.emergentagent.net/job_6ec3c2c7-9bb5-44f7-b887-96266a502e76/artifacts/3b393eio_group-photo-hero-bg-bright.png",
  school: "https://customer-assets-4nw71qhi.emergentagent.net/job_6ec3c2c7-9bb5-44f7-b887-96266a502e76/artifacts/xqiu4mmv_school-bg.webp",
  qr: "https://customer-assets-4nw71qhi.emergentagent.net/job_6ec3c2c7-9bb5-44f7-b887-96266a502e76/artifacts/zzm6geao_payment-qr.png",
  // Newest real event photos
  paramountPlacard: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/apva2heb_image.png",
  yogiPlacard: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/9m08j0g7_image.png",
  speakerPortrait: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/r9bclegh_image.png",
  countryPlacards: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/5d8n48mt_image.png",
};

// Hero cinematic photo cycle — real photos only; group photo leads, school building follows
export const HERO_PHOTOS = [
  ASSET.groupPhoto,
  ASSET.school,
  ASSET.classroomGroup,
  ASSET.countryPlacards,
  ASSET.award2,
];

// Gallery bento tiles — real event photos only
export const GALLERY = [
  { src: ASSET.countryPlacards, alt: "Delegates with country placards — Paramount International MUN", span: "lg:col-span-4 lg:row-span-2" },
  { src: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/qgqevj1b_image.png", alt: "Delegate representing Russia in UNGA", span: "lg:col-span-2" },
  { src: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/eug6gqi0_image.png", alt: "Delegates at the conference lunch", span: "lg:col-span-2" },
  { src: ASSET.groupPhoto, alt: "Delegates of Paramount International MUN", span: "lg:col-span-3" },
  { src: ASSET.classroomGroup, alt: "Committee in session", span: "lg:col-span-2" },
  { src: ASSET.speakerPortrait, alt: "A delegate addresses the committee", span: "lg:col-span-2" },
  { src: ASSET.award2, alt: "Best Delegate award — UNGA", span: "lg:col-span-2" },
];

// Official committee emblems (real logos uploaded by organizers)
export const COMMITTEE_LOGOS = {
  unga: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/dxvo3ut7_image.png",
  aippm: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/i2b03jih_image.png",
  who: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/m8ju3l6q_image.png",
  uncsw: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/7580vtiy_image.png",
  unhrc: "https://customer-assets-eiarnc6j.emergentagent.net/job_paramount-mun/artifacts/w1oovavj_image.png",
};
