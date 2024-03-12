//Service.ts
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/files/folder";
import "@pnp/sp/items/get-all";
import "@pnp/sp/lists";
import { getSP } from "../helpers/PnpConfig";
 
export async function Adding(
  title: string,
  image: File | null,
  url: string,
  userEmail: string
) {
  try {
    console.log("Adding function called with:", title, image, url, userEmail);

    const sp = getSP();
    if (!image) {
      throw new Error("Image file is required.");
    }

    const requestData = {
      Title: title,
      URL: url,
      UserEmail: userEmail,
    };

    console.log("Request Payload to SharePoint:", requestData);

    const response = await sp.web.lists.getByTitle("Product").items.add(requestData);

    const itemId = response.data.Id;
    console.log("Item added to SharePoint with ID:", itemId);

    const item = sp.web.lists.getByTitle("Product").items.getById(itemId);

    console.log("Uploading image to Attachments...");

    const attachmentFileName = `${itemId}_${image.name}`;
    await item.attachmentFiles.add(attachmentFileName, image);

    console.log("Image added to Attachments with name:", attachmentFileName);

  } catch (error) {
    console.error("Error adding item to the list:", error);
    throw error;
  }
}

// export async function Fetch(email:string){
//   const sp = getSP();
//   const listAddResult: any = await sp.web.lists.getByTitle("Productivity").items.filter(`userEmail eq ${email}`).select("Attachment,AttachmentFiles,Title,URL").expand("AttachmentFiles").getAll();
 
 
//     console.log(listAddResult);
//     return listAddResult;
// }
 
  export async function Fetch(email: string) {
    const sp = getSP();
    try {
      const allItems: any[] = await sp.web.lists.getByTitle("Product").items.select("ID,Attachments,AttachmentFiles,Title,URL,UserEmail").expand("AttachmentFiles").getAll();
      console.log(allItems);
      const filteredItems = allItems.filter(item => item.UserEmail.startsWith(email));
      console.log(filteredItems);
     
      return filteredItems;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
  

  export async function EditItem(itemId: number, title: string, url: string) {
    try {
      const sp = getSP();
  
      const requestData = {
        Title: title,
        URL: url,
      };
  
      // Include the itemId in the update request
      await sp.web.lists.getByTitle("Product").items.getById(itemId).update(requestData);
  
      console.log("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }
  
  export async function DeleteItem(itemId: number) {
    try {
      const sp = getSP();
      console.log("Deleting item with ID:", itemId);

      const response=await sp.web.lists.getByTitle("Product").items.getById(itemId).delete();
      console.log(response);
      
  
      console.log("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
    
  }

  
