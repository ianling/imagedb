import {Image, ImageArray} from "./image";

export default class ImageDB {
    private _images = new ImageArray<Image>();

    async load(path: string) {
        let prefix = path.split('/').slice(0, -1).join('/');
        prefix += prefix ? "/" : "";

        let response = await fetch(path);
        if (!response.ok) {
            throw Error(`failed to load ImageDB from path ${path} -- HTTP ${response.status}`);
        }

        const images: Image[] = await response.json();

        images.forEach((_image, index, array) => {
            // apply path prefix to each image
            array[index].path = `${prefix}${array[index].path}`;
            array[index].thumbnailPath = array[index].thumbnailPath ? `${prefix}${array[index].thumbnailPath}` : "";
        });

        this._images.push(...images)
    }

    async loadDBsFromList(listPath: string) {
        let dbPathPrefix = listPath.split('/').slice(0, -1).join('/');
        dbPathPrefix += dbPathPrefix ? "/" : "";

        let response = await fetch(listPath);
        if (!response.ok) {
            throw Error(`failed to load DB list from path ${listPath} -- HTTP ${response.status}`);
        }

        const dbs: string[] = await response.json();

        const promises = new Array<Promise<void>>;
        dbs.forEach((db) => promises.push(this.load(dbPathPrefix + db)));

        await Promise.all(promises);
    }

    images(): ImageArray<Image> {
        return this._images;
    }
}
