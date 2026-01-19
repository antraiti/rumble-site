export function downloadJsonFile(jsonData: string, filename: string) {
    // Create a Blob object from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename); // Set the download attribute with the desired filename

    // Append the link to the body (necessary for Firefox)
    document.body.appendChild(link);
    
    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by removing the link and revoking the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function downloadImage(imageUrl: string, filename = 'missing_name.png') {
  try {
    // 1. Fetch the image data as a Blob.
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // 2. Create a temporary object URL for the blob.
    const objectUrl = URL.createObjectURL(blob);

    // 3. Create an anchor element to trigger the download.
    const anchorElement = document.createElement('a');
    anchorElement.href = objectUrl;
    anchorElement.download = filename; // Set the desired file name.

    // 4. Append the anchor to the body, click it programmatically, and remove it.
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);

    // 5. Revoke the object URL to free up memory.
    URL.revokeObjectURL(objectUrl);
    console.log('Image download initiated successfully.');

  } catch (error) {
    console.error('Error downloading the image:', error);
    // This error is often due to a lack of CORS headers on the image server.
    alert('Failed to download image. Check console for CORS errors.');
  }
}