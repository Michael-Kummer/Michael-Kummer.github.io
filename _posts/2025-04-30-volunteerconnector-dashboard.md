---
layout: post
title: VolunteerConnector Dashboard
date: 2025-04-30 04:14 -0600
math: True
mermaid: True
---
Note: As this project is ongoing there is not enough data to properly populate some plots. As more time passes the graphs will automatically repopulate to be more accurate.

## 1. Dashboard Introduction

This is a dashboard that tracks Canadian Volunteer Opportunities from the VolunteerConnector API. This dashboard is updated regularly to show what the current volunteer landscape is.
The goals are to track the following differences once there is enough data:
- Temporary vs Evergreen Postings
- Student vs non-Student positions
- Non-Senior vs Senior positions
- Rural vs Urban positions
- Remote vs In-person positions

## 2. Opportunity Landscape

<div class="plotly-container">
  <iframe src="{{ '/assets/postImages/post3/ActivityPieChart.html' | relative_url }}"
          style="width: 100%; height: 600px; border: none;"
          scrolling="no"></iframe>
</div>

<style>
.plotly-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 20px;
}

/* For mobile screens, adjust height */
@media (max-width: 768px) {
  .plotly-container iframe {
    height: 450px;
  }
}
</style>

## 3. Geographic & Organizational Insights
Overwhelmingly VolunteerConnector is used by Western Canada.

<div class="plotly-container">
  <iframe src="{{ '/assets/postImages/post3/interactiveMap.html' | relative_url }}"
          style="width: 100%; height: 600px; border: none;"
          scrolling="no"></iframe>
</div>

<style>
.plotly-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 20px;
}

/* For mobile screens, adjust height */
@media (max-width: 768px) {
  .plotly-container iframe {
    height: 450px;
  }
}
</style>

## 4. Filterable Histogram
Currently this chart is not populated with enough data to be fully useful, but as time goes on more observations will be captured and significant trends will emerge.

<div class="bokeh-container">
  <iframe src="{{ '/assets/postImages/post3/opportunitiesInteractive.html' | relative_url }}"
          style="width: 100%; height: 600px; border: none;"
          scrolling="no"></iframe>
</div>
<style>
.bokeh-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  margin-bottom: 50px; /* Add more space below the container */
  height: 600px; /* Fixed height instead of aspect ratio */
  position: relative;
}
.bokeh-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}
/* For mobile screens */
@media (max-width: 768px) {
  .bokeh-container {
    height: 500px; /* Slightly smaller on mobile */
  }
}
</style>


## 5. How was all of this done?
This is (almost) entirely automated. The only thing that isn't automated is the final step of pushing the changes to the page.
The pipeline is below:


![VolunteerConnector Pipeline]({{ '/assets/postImages/post3/MermaidDiagram.svg' | relative_url }}){: w="350" h="250"}



