/**
 * This file can be used to store global variables that you need to access across multiple places.
 * We've put a few here that we know you will need.
 * Fill in the blank for each one
 */
export const MY_BU_ID = "U11586865";  
export const BASE_API_URL = "https://spark-se-assessment-api.azurewebsites.net/api";
export const TOKEN = "6se7z2q8WGtkxBlXp_YpU-oPq53Av-y_GSYiKyS_COn6AzFuTjj4BQ==";


export const GET_DEFAULT_HEADERS = () => {
  var headers = new Headers();
  headers.append('x-functions-key', TOKEN);
  headers.append('BU-ID', MY_BU_ID); // Added your BU ID to the default headers
  return headers;
};
