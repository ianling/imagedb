export interface Image {
    path: string;
    thumbnailPath: string;
    title: string;
    description: string;
    tags: string[];
    creationDate: string;
}

export class ImageArray<T> extends Array {
    _imagesPerPage: number;
    _imagesPerPageExplicit: number[]; // allows explicitly defining the number of images to display on each page

    constructor(...images: T[]) {
        super();
        this.push(...images);
        Object.setPrototypeOf(this, Object.create(ImageArray.prototype));

        this._imagesPerPage = 10;
        this._imagesPerPageExplicit = [];
    }

    // Logical AND of tags
    queryTags(tags: string[]): ImageArray<T> {
        const filtered: Image[] = this.filter((image: Image) =>
            tags.every((tag) => {
                    let tagParts = tag.split(":");
                    if (tagParts.length > 1) {
                        // we're searching for a set or some other meta-tag, we need to ignore the third chunk if it exists
                        tag = tagParts.slice(0, 2).join(":");
                        return image.tags.some((imageTag) => imageTag.split(":").slice(0, 2).join(":") === tag);
                    }

                    return image.tags.indexOf(tag) !== -1;
                }
            )
        );

        // prevent weird behavior I don't understand where this function can return [0]
        // @ts-ignore
        if(filtered.length === 1 && filtered[0] === 0) {
            filtered.pop();
        }

        return new ImageArray<Image>(...filtered);
    }

    setImagesPerPage(n: number): ImageArray<T> {
        this._imagesPerPage = n;
        return this;
    }

    setImagesPerPageExplicit(...imagesPerPage: number[]): ImageArray<T> {
        this._imagesPerPageExplicit = imagesPerPage;
        return this;
    }

    maxPage(): number {
        let imagesUnaccountedFor = this.length;
        this._imagesPerPageExplicit.forEach((numImagesOnPage) => imagesUnaccountedFor -= numImagesOnPage);
        return Math.max(1, this._imagesPerPageExplicit.length + Math.ceil(imagesUnaccountedFor / this._imagesPerPage));
    }

    // Divides the array into pages, returns an ImageArray containing the images in the specified page.
    getPage(currentPage: number): ImageArray<T> {
        let startIndex = 0;
        let endIndex = 0;

        // default to using _imagesPerPage if the explicit version is not specified
        if (this._imagesPerPageExplicit.length == 0) {
            startIndex = (currentPage - 1) * this._imagesPerPage;
            endIndex = currentPage * this._imagesPerPage;
        } else if (currentPage > this._imagesPerPageExplicit.length) {
            // explicit numbers of images are specified, however the user has requested a page beyond what is explicitly defined
            let imagesUnaccountedFor = this.length;
            this._imagesPerPageExplicit.forEach((num) => imagesUnaccountedFor -= num);
            startIndex = this.length - imagesUnaccountedFor;
            endIndex = startIndex + this._imagesPerPage;
        } else {
            // the user has requested a page with an image count that is explicitly defined
            for (let ii = 0; ii < this._imagesPerPageExplicit.length; ii++) {
                if (ii === currentPage - 1) {
                    endIndex = startIndex + this._imagesPerPageExplicit[ii];
                    break;
                }

                startIndex += this._imagesPerPageExplicit[ii];
            }
        }

        return new ImageArray<Image>(...this.slice(startIndex, endIndex));
    }

    // firstN returns the first n images in the ImageArray.
    firstN(n: number): ImageArray<T> {
        return new ImageArray<Image>(...this.slice(0, n));
    }

    // Append all images in the ImageArray to the specified element
    // using the first element with the ID `image-template` in the document as a template for each image.
    // See the example directory for usage.
    appendToElementUsingTemplate(element: HTMLElement) {
        const template = document.querySelector<HTMLTemplateElement>("#image-template");
        if (!template) throw new Error("no element #image-template");

        this.forEach((image: Image) => {
            const clone = template.cloneNode(true) as HTMLTemplateElement;

            clone.innerHTML = clone.innerHTML.replaceAll("{{image.title}}", image.title);
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.description}}", image.description);
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.path}}", image.path);
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.thumbnailPath}}", image.thumbnailPath ? image.thumbnailPath : image.path);
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.thumbnailPathURLEncoded}}", encodeURIComponent(image.thumbnailPath ? image.thumbnailPath : image.path));
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.pathURLEncoded}}", encodeURIComponent(image.path));
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.creationDate}}", image.creationDate);
            // TODO: better way to display tags

            const cloneDocumentFragment = clone.content;

            const imgElem = cloneDocumentFragment.querySelector<HTMLImageElement>(".image");
            if (imgElem) imgElem.src = image.path;

            const thumbnailElem = cloneDocumentFragment.querySelector<HTMLImageElement>(".thumbnail");
            if (thumbnailElem) thumbnailElem.src = image.thumbnailPath ? image.thumbnailPath : image.path;

            const titleElem = cloneDocumentFragment.querySelector(".title");
            if (titleElem) titleElem.textContent = image.title;

            const desciptionElem = cloneDocumentFragment.querySelector(".description");
            if (desciptionElem) desciptionElem.textContent = image.description;

            const creationDateElem = cloneDocumentFragment.querySelector(".creation-date");
            if (creationDateElem) creationDateElem.textContent = image.creationDate;

            const tagsElem = cloneDocumentFragment.querySelector(".tags");
            if (tagsElem) tagsElem.textContent = image.tags.map((value) => `#${value}`).join(", ");

            element.appendChild(cloneDocumentFragment);
        });
    }

    tagCounts(): Map<string, number> {
        const tagCounts = new Map<string, number>();

        this.forEach((image: Image) => {
            // keep track of counts for each tag
            image.tags?.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
        });

        return tagCounts;
    }
}
