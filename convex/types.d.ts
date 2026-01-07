declare module "pptx-parser" {
  interface SlideImage {
    data: string | Buffer;
    mimeType?: string;
  }

  interface Slide {
    text?: string;
    images?: SlideImage[];
  }

  interface PPTX {
    slides: Slide[];
  }

  function parse(buffer: Buffer): Promise<PPTX>;
  export default parse;
}
