---
layout: post
title: VolunteerConnector Dashboard
description: Charts of Canadian volunteer postings from the VolunteerConnector API.
date: 2025-04-30 04:14 -0600
last_modified_at: # never updated; leave empty so no "Updated" line shows
math: True
mermaid: True
---
Note: This dashboard is no longer updated. Data collection stopped on April 30, 2025, so some plots have limited data.

## 1. Dashboard Introduction

This is a dashboard that tracks Canadian Volunteer Opportunities from the VolunteerConnector API. It shows the volunteer landscape up to April 30, 2025, when updates stopped.
The goals are to track the following differences once there is enough data:
- Temporary vs Evergreen Postings
- Student vs non-Student positions
- Non-Senior vs Senior positions
- Rural vs Urban positions
- Remote vs In-person positions

## 2. Opportunity Landscape

{% include chart.html src="/assets/postImages/post3/ActivityPieChart.html" height=600 title="Volunteer activities by category" %}

## 3. Geographic & Organizational Insights
Overwhelmingly VolunteerConnector is used by Western Canada.

{% include chart.html src="/assets/postImages/post3/interactiveMap.html" height=600 title="Map of volunteer postings" %}

## 4. Filterable Histogram
This chart has too little data to show strong trends.

{% include chart.html src="/assets/postImages/post3/opportunitiesInteractive.html" height=500 title="Filterable histogram of opportunities" %}


## 5. How was all of this done?
This is (almost) entirely automated. The only thing that isn't automated is the final step of pushing the changes to the page.
The pipeline is below:


```mermaid
flowchart TD
    A[("VolunteerConnector API")] -->|"Python script requests that day's positions as JSON"| B[("Local SQLite3 database (.db file on home server)")]
    B --> C["Analysis Python script (Pandas & Plotly)"]
    C --> D["Personal GitHub page"]
```



