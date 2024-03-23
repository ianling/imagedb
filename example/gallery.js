import ImageDB from "../dist/imagedb.js";

let db = new ImageDB;
await db.load("image_list.json");

const query = new URLSearchParams(location.search);
const tagsToFilterOn = query.getAll("tag");

const galleryDiv = document.getElementById("gallery");

(tagsToFilterOn.length > 0
    ? db.images().queryTags(tagsToFilterOn)
    : db.images()
).appendToElementUsingTemplate(galleryDiv);
