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
        if (!template) throw new Error("no element #image-template ")

        this.forEach((image: Image) => {
            const clone = template.content.cloneNode(true) as HTMLElement;

            const imgElem = clone.querySelector<HTMLImageElement>(".image");
            if (imgElem) imgElem.src = image.path;

            const titleElem = clone.querySelector(".title");
            if (titleElem) titleElem.textContent = image.title;

            const desciptionElem = clone.querySelector(".description");
            if (desciptionElem) desciptionElem.textContent = image.description;

            const creationDateElem = clone.querySelector(".creation-date");
            if (creationDateElem) creationDateElem.textContent = image.creationDate;

            const tagsElem = clone.querySelector(".tags");
            if (tagsElem) tagsElem.textContent = image.tags.map((value) => `#${value}`).join(", ");

            element.appendChild(clone);
        });
    }
}
