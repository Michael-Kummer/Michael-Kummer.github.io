---
layout: post
title: WIP Volunteerism In Alberta
date: '2024-12-31 16:22:20 -0700'
---

##### Background
<p>The nonprofit sector of Alberta's experiencing new trends and exacerbation of old ones. Currently we're seeing declines in the number of Canadians making charitable donations, that some Canadians are feeling more disconnected and not giving money or time, and increased service usage (Giving survey, 2024). Given these new changes there needs to be adaptation and new techniques used by nonprofits to engage communities.</p>
Previously recruiting volunteers entailed a rough strategy consisting of:
Cold Recruitment -> Training and integration -> Word-of-mouth recruitment


From my own personal experience i've found the following to be generally true:
- A majority of the volunteer work is done by a minority of volunteers who are highly engaged
- Consistent community engagement is extremely difficult on coordinators. I've noticed most organizations work in phases or campaigns instead of constantly keeping up pressure.
- It's better to target certain populations instead of casting a wide of net as possible.
	- Ex. leadership groups, or certain student groups

Currently the nonprofit sector is facing a variety of changes that each organization can fit into:
1) They are receiving decreased donations in past years
2) They are receiving the same or more in donations from a smaller group of individuals

College age individuals need little reason or request to begin or try to apply volunteering. Seniors need genuine outreach to volunteer. Individuals in between might not volunteer unless they have an explicit reason to as in they truly want to volunteer there or they need professional hours.


##### Discussion
We know from the Giving Report that people volunteer when they feel connected and are able to see direct results - hence why environmental factors were focused upon as the results are typically not immediate and potentially less tangible. For other organizations not in environment, the decline in consecutiveness means more isolation for seniors. Since we cannot literally reach out to every senior in isolation, we must go through large community groups and have them distribute volunteering opportunities.

The pandemic has caused a lot of isolation and potentially even decline. If there's documented analysis we can make the following two hypothesis where one is based in the recent term, and one is focused on long term effects:
1) Post-Pandemic will show, we can expect to see a decrease in volunteerism due to isolation and we can see an increase in intensity in volunteering due to the intentionality behind volunteering for the community.
To make 1) disprovable, we will try to look through the most recent data, but we will fully understand this effect once the most recent Giving, Volunteering and Participating (GVP) survey based on 2024 data is released. At best, we can predict the falsifiability of this statement until the survey is released.

1) Economically, we can potentially see a similar effect. Given Alberta is a resource economy definitionally it will experience large booms and large busts that is pegged directly to the value of resources. Potentially in these bust cycles we can see the same effects.
For 2) to be disprovable we can look at data on Alberta's economic dashboard for 2022/23. We do not necessarily have anything to compare our survey data to until GSV 2024 is released, but we might be able to see some broad trends.


## Methods
Currently we're working on outdated information based on the Giving Survey that is pre-covid. The most recent raw data we have is based on the Government of Alberta's 2023 Online survey. This survey is extremely broad, but contains sections based on volunteerism and we have around 600 responses for volunteer-related items so it is currently the best we have.

In cleaning the data I replaced the questions with the guidebook, then I simplified the questions. This was done using Pandas and PlotNine, though PlotNine can easily be substituted for Matplotlib or any other python plotting program.

After importing the data we can use the questions to create a dictionary and substitute our codes. We can also create simplified names for our questions.

```
rename_dict = dict(zip(
    onlineQuestions['Variable'],  # Original names
    onlineQuestions['Label'].str.split('--').str[1].str.strip()  # Clean labels
))

renamedOnline22 = onlineRawData.rename(columns = rename_dict)
```


Many responses had to be turned into np.na to not interfere with the data. Any skipped, empty, or unknown responses were turned into N/A.


#### Who's Volunteering?

Notably right after this we can see the following for how much time is being spent volunteering:

![[Hours Volunteered.png]]({{'/assets/postImages/post1/Hours-Volunteered.png' | relative_url}})


##### Where are we going wrong?

Interestingly enough opportunities to improve ones skillset is not necessarily appealing to most volunteers, especially senior volunteers.


![[Skillset.png]]({{'/assets/postImages/post1/Skillset.png' | relative_url}})



In terms of volunteer appreciation we see that increasing levels of volunteer appreciation might not have the impact most coordinators believe it will. This effect is more pronounced in volunteers who are older too.

![[Volunteer Appreciation.png]]({{'/assets/postImages/post1/Volunteer-Appreciation.png' | relative_url}})



##### Possible Improvements

Interestingly enough for possible improvements it seems as senior volunteers are not entirely engaged by volunteer appreciation and are not looking for any direct benefit. This is most likely due to seniors volunteering for the sake of helping more than anything else. Volunteering is a way to talk to others, stay engaged, and get out of the house. 

Since seniors are not necessarily able or willing to drive out to locations to volunteer, they are limited to areas close by. Given this coordinators should focus on engaging seniors who are nearby. Those senior volunteers who are nearby also most likely know other seniors meaning we can easily compound our efforts through word-of-mouth recruitment


### WIP




##### Correlations

Since we are working with solely categorical and binned data we are limited in our options for finding out relations between variables.



