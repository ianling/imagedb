export interface Image {
    path: string;
    title: string;
    description: string;
    tags: string[];
    creationDate: string;
}

export class ImageArray<T> extends Array {
    _imagesPerPage: number;

    constructor(...images: T[]) {
        super();
        this.push(...images);
        Object.setPrototypeOf(this, Object.create(ImageArray.prototype));

        this._imagesPerPage = 10;
    }

    // Logical AND of tags
    queryTags(tags: string[]): ImageArray<T> {
        const filtered = this.filter((image) =>
            tags.every((tag) =>
                image.tags.indexOf(tag) !== -1
            )
        );

        return new ImageArray<Image>(...filtered);
    }

    setImagesPerPage(n: number): ImageArray<T> {
        this._imagesPerPage = n;
        return this;
    }

    // Divides the array into pages, returns an ImageArray containing the images in the specified page.
    getPage(currentPage: number): ImageArray<T> {
        const startIndex = (currentPage - 1) * this._imagesPerPage;
        const endIndex = currentPage * this._imagesPerPage;

        return new ImageArray<Image>(...this.slice(startIndex, endIndex));
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
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.pathURLEncoded}}", encodeURIComponent(image.path));
            clone.innerHTML = clone.innerHTML.replaceAll("{{image.creationDate}}", image.creationDate);
            // TODO: better way to display tags

            const cloneDocumentFragment = clone.content;

            const imgElem = cloneDocumentFragment.querySelector<HTMLImageElement>(".image");
            if (imgElem) imgElem.src = image.path;

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
}
