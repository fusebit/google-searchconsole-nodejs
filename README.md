<p align="center">
  <a href ="https://join.slack.com/t/fusebitio/shared_invite/zt-qe7uidtf-4cs6OgaomFVgAF_fQZubfg"><img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white" width="100" /></a>
  <a href = "https://discord.gg/SN4rhhCH"><img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" width="100" /></a>
  <a href = "https://twitter.com/fusebitio"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" width="100" /></a>
</p>

## Intro

Google Search Console is a free service offered by Google that helps you monitor, maintain, and troubleshoot your site's presence in Google Search results. You don't have to use the Search Console to be included in Google Search results, but Search Console helps you understand and improve how Google sees your site.

For business stakeholders, responding to real-time information on their online properties can have a real impact on their bottom line. Google’s Search Console API is an extremely useful tool for webmasters who rely on traffic data and SEO optimizations as a critical part of informing their online strategy. 

The Search Console API offers four key capabilities:

- [Search Analytics](https://developers.google.com/webmaster-tools/v1/api_reference_index#Search_analytics) - Query traffic data for your site.
- [Sitemaps](https://developers.google.com/webmaster-tools/v1/api_reference_index#Sitemaps) - List all your sitemaps, request information about a specific sitemap, and submit a sitemap to Google.
- [Sites](https://developers.google.com/webmaster-tools/v1/api_reference_index#Sites) - List/add/remove properties from your Search Console account.
- [URL Inspection](https://developers.google.com/webmaster-tools/v1/api_reference_index#Inspection_tools) - Inspect the status of a page in the Google index (equivalent to URL Inspection in Search Console)

In this post, we’ll use [Google's Node.js SDK](https://github.com/googleapis/google-api-nodejs-client) to connect to the Search Console API. With the use of code examples, we’ll walk through a very common use case: Submitting an updated Sitemap to Google for indexing and monitoring the impact on your site’s online presence. 

## Configure Access Credentials

Before you can get started with code, you will need to make sure that you enable the Search Console API for your website, or property, and set up a Service Account with the right access credentials to send requests using the Google API.

1. Enable the API [here](https://console.developers.google.com/apis/api/searchconsole.googleapis.com)
2. Create a Service Account in the Google Developers Console [here] (https://console.cloud.google.com/iam-admin/serviceaccounts)
3. For this newly created Service Account, navigate to ‘Keys’, create a new key, and save the JSON file somewhere secure. Your Node.js application will use these credentials to access the API .
4. Add the email address of this newly created Service Account as an owner in the Search Console [here](https://search.google.com/search-console/users)

Note: Only a **verified owner** of the property can perform this step.

## Get Started 

Now that you’ve configured the proper access credentials let’s get started with the fun part - the code. In this first part, you’ll need to set up the auth and also make sure that your credentials are properly configured for your Search Console property.

In your terminal, start up a new node project and install the required packages:

`npm init`
`npm install googleapis`
`npm install google-auth-library`

In this same directory, you will also need to place the `keys.json` file that you had created earlier. Once you’ve got that set up, create a new `index.js` file and paste in the following code:

```javascript
 const {google} = require('googleapis');
 const {JWT} = require('google-auth-library');
 const searchconsole = google.searchconsole('v1');
  const keys = require(‘PATH_TO_KEYS.JSON_FILE’)
  const client = new JWT({
    email: 'keys.client_email',
    key: 'keys.private_key’,
    scopes: ['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/webmasters.readonly'],
  });
  google.options({auth: client});
// Check to see which properties are accessible with these credentials
      const resSiteList = await searchconsole.sites.list({});
      console.log(resSiteList.data);
```

If you don’t see your property in the list of sites returned, check to see if you’ve added the Service Account to the right property in your Google Search Console. 

Once you’ve got that working, we can immediately send requests and queries to the Search Console.

## Submit a New URL to Google for Indexing


Whether it’s a new product page or a new blog post, you want to make them easily searchable as quickly as possible. You can automate this step by submitting the updated sitemap to the Sitemaps endpoint as an automated step in your CI/CD workflow. 

```javascript
        const res = await searchconsole.sitemaps.submit({
          // The URL of the actual sitemap. For example: `https://fusebit.io/sitemap.xml`.
          feedpath: 'placeholder-value',
          // The site's URL, including protocol. For example: `https://fusebit.io/`.
          siteUrl: 'placeholder-value',
        });
        console.log(res.data);
      }
```

## Check to see if it has been indexed

Once you’ve submitted a new URL to the indexing API, the actual crawling can take anywhere from a few days to a few weeks. To avoid having to manually check, you can set up a scheduled job to check the status of your newly submitted URLs and see if they’ve been indexed using the URL Inspection endpoint. 

```javascript
   const res = await searchconsole.urlInspection.index.inspect({
     // Request body metadata
     requestBody: {
       // request body parameters
       // {
          "inspectionUrl": "https://fusebit.io/blog/nodejs-https-imports/",
          "languageCode": "en-US",
          "siteUrl": "https://fusebit.io/"
       // }
     },
   });
   console.log(res.data);
```

Learn more about Google’s re-indexing process for Sitemaps [here](https://developers.google.com/search/docs/advanced/crawling/ask-google-to-recrawl).

## Check to see a change in clicks/impressions

Now that your newly published site has been indexed, you may want to see how impressions or clicks are changing over time for your recent posts. You can do this by leveraging the Search Analytics endpoint and specifying the URL and date range.

```javascript
// Search Analytics on your Website
      const resSearchAnalytics = await searchconsole.searchanalytics.query({
        // The site's URL, including protocol. For example: `http://www.example.com/`.
        siteUrl: 'https://fusebit.io/',
   
        requestBody: {
             "endDate": "2022-03-08",
             "startDate": "2022-03-01",
 "dimensions": ["date"]
        },
      });
      
      console.log(resSearchAnalytics.data.rows);
```

For the example above, in the response body you will receive a `rows` object with four items for each data point:

**Clicks** - How often someone clicked a link from Google to your site
**Impressions** - How often someone saw a link to your site on Google
**CTR** - The calculation of (clicks ÷ impressions)
**Position** - A relative ranking of the position of your link on Google, where 1 is the topmost position, 2 is the next position, and so on

To learn more about how these are calculated, read here: [What are impressions, position, and clicks? - Search Console Help](https://support.google.com/webmasters/answer/7042828?hl=en)


### Bonus: See the "average position" of specific keywords

In the above example, we showed you how to see aggregated data for your website, however, you can add different dimensions to break down your results to get a deeper understanding. For example, if the new product page you just published has certain keywords you were targeting for SEO, you can send a daily report of how those search terms are performing directly to your team’s Slack channel.

```javascript
// Search Analytics on your Website
      const resSearchAnalytics = await searchconsole.searchanalytics.query({
        // The site's URL, including protocol. For example: `http://www.example.com/`.
        siteUrl: 'https://fusebit.io/',
   
        requestBody: {
             "dimensionFilterGroupsfilters":["query contains node"],
             "dimensions": ["query"],
             "endDate": "2022-03-08",
             "startDate": "2022-03-01",
        },
      });
      
      console.log(resSearchAnalytics.data.rows);
```

In the example above, we use `dimensionFilterGroupsfilters` to specify that we want to see how the keyword ‘node’ impacts our search positions and then break the results down based on the individual queries.

Learn more about the different dimensions and filters [here](https://developers.google.com/webmaster-tools/v1/searchanalytics/query#dimensionFilterGroups.filters)

## Conclusion

Hopefully, you’ll find the above code and implementation details helpful. While using it, please note that Google’s API limits you to 2,000 queries a day and 600 queries per minute, which is probably something you’ll never cross.

Don’t hesitate to reach out if you have any questions, and we’ll be happy to help push you through. 

You can find me on the [Fusebit Discord](https://discord.gg/SN4rhhCH), our [community Slack](https://join.slack.com/t/fusebitio/shared_invite/zt-qe7uidtf-4cs6OgaomFVgAF_fQZubfg), and at [shehzad@fusebit.io](mailto:shehzad@fusebit.io).