import {Image, ImageArray} from "./image";

export default class ImageDB {
    private _images = new ImageArray<Image>();
    private prefix = "";

    async load(path: string, imagePathPrefix: string = "") {
        this.prefix = imagePathPrefix;

        let response = await fetch(path);
        if (!response.ok) {
            throw Error(`failed to load ImageDB from path ${path} -- HTTP ${response.status}`);
        }

        const images: Image[] = await response.json();

        // apply path prefix to each image
        images.forEach((_elem, index, array) => array[index].path = `${this.prefix}${array[index].path}`)

        this._images = new ImageArray<Image>(...images)
    }

    images(): ImageArray<Image> {
        return this._images;
    }
}
