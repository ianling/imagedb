import {Image, ImageArray} from "./image";

export default class ImageDB {
    private _images = new ImageArray<Image>();

    async load(path: string) {
        let response = await fetch(path);
        if (!response.ok) {
            throw Error(`failed to load ImageDB from path ${path} -- HTTP ${response.status}`);
        }

        const images = await response.json();
        this._images = new ImageArray<Image>(...images)
    }

    images(): ImageArray<Image> {
        return this._images;
    }

    // Logical AND of tags
    queryTags(tags: string[]): ImageArray<Image> {
        const filtered = this._images.filter((image) =>
            tags.every((tag) =>
                image.tags.indexOf(tag) !== -1
            )
        );

        return new ImageArray<Image>(...filtered);
    }
}
