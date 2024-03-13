import ImageDB from "../dist/main.js";

let db = new ImageDB;
await db.load("image_list.json");

const query= new URLSearchParams(location.search);
const tagsToFilterOn = query.getAll("tag");

const images = tagsToFilterOn.length > 0 ? db.queryTags(tagsToFilterOn) : db.images;

const galleryDiv = document.getElementById("gallery");

images.appendToElementUsingTemplate(galleryDiv);
