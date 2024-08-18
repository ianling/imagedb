import {Image, ImageArray} from "./image";

export default class ImageDB {
    private _images = new ImageArray<Image>();

    // Loads a single array of images from the given path.
    // This function does not download the images, it only downloads the JSON from the given path.
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

    // Loads an array of paths to additional arrays and then calls load() on each path.
    // Example: loadDBsFromList("dbs.json"), where dbs.json contains ["db1.json", "db2.json", "db3.json"]
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

    // Returns an ImageArray of all the images loaded using load and loadDBsFromList.
    images(): ImageArray<Image> {
        return this._images;
    }
}
