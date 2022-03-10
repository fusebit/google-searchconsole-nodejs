// - Enable the API at:
//   https://console.developers.google.com/apis/api/searchconsole.googleapis.com

// - Create a Service Account in the Google Developers Console at: 
//   https://console.cloud.google.com/iam-admin/serviceaccounts
//   Save the keys in the local directory

// - Add the email address of this newly created Service Account as an owner in the Search Console
//   https://search.google.com/search-console/users

const { google } = require("googleapis");
const { JWT } = require("google-auth-library");
const searchconsole = google.searchconsole("v1");

async function main() {

  // Authentication
  const keys = require("PATH_TO_KEYS.JSON_FILE");
  const client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: [
      "https://www.googleapis.com/auth/webmasters",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
  google.options({ auth: client });

  // Check which sites belong to this authorized account
  const resSiteList = await searchconsole.sites.list({});
  console.log(resSiteList.data);

  // Submit a URL for Inspection
  const res = await searchconsole.sitemaps.submit({
    feedpath: 'https://fusebit.io/sitemap.xml',
    siteUrl: 'https://fusebit.io/',
  });
  console.log(res.data);
}

  // Inspect if a URL has been indexed
  const resInspectURL = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: "https://fusebit.io/blog/nodejs-https-imports/",
      languageCode: "en-US",
      siteUrl: "https://fusebit.io/",
    },
  });
  console.log(resInspectURL.data);


  // Search Analytics on your Website
  const resSearchAnalytics = await searchconsole.searchanalytics.query({
    siteUrl: 'https://fusebit.io/',

    // Detailed Query Parameters: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
    requestBody: {
         "endDate": "2022-03-08",
         "startDate": "2022-03-01",
         "dimensionFilterGroupsfilters": ["query contains node"],
         "dimensions": ["query"],
         "rowLimit": 10
    },
  });
  
  console.log(resSearchAnalytics.data.rows);

main().catch((e) => {
  console.error(e);
  throw e;
});
