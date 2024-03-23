export interface Image {
    path: string;
    title: string;
    description: string;
    tags: string[];
    creationDate: string;
}

export class ImageArray<T> extends Array {
    constructor(...images: T[]) {
        super();
        this.push(...images);
        Object.setPrototypeOf(this, Object.create(ImageArray.prototype));
    }

    // ensure your DOM contains something with the
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
