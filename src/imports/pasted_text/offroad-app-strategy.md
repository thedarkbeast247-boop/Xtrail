Yes — you can build this.

You do not need to become a traditional software engineer first. But you do need to treat this like a business + product project, not just “make an app.” The good news is your idea is solid: onX Offroad already proves there is demand for trail discovery, offline maps, tracking, route planning, land data, and subscriptions. Their current app emphasizes trail discovery for SxS, 4x4, ATV, dirt bike, and snowmobiles; offline maps; route planning; trip tracking; CarPlay/Android Auto; and paid tiers around Premium and Elite.

My honest recommendation: build version 1 yourself with a no-code / low-code stack, then only move deeper into custom code when the product has real users. FlutterFlow officially positions itself as a visual app builder for mobile/web/desktop and supports code export; Supabase provides hosted Postgres, auth, storage, realtime, and APIs; RevenueCat is built specifically to handle subscriptions across App Store and Google Play; and Mapbox supports mobile maps plus offline map workflows. That combination is the fastest path for a non-developer building a serious subscription app.

Here is the best way to think about your product:

Phase 1: make the “must-have” app, not the “everything” app.
Your first version should do only 6 things:

user signup/login
record a ride with GPS
save a trail or route
upload photos and notes
browse community trails by vehicle class
lock premium features behind subscription
That is enough to launch and learn. Everything else can come later.

A strong MVP feature set for your app would be:

Free tier

create account
view public trails
filter by vehicle class: ATV, motocross, dual-sport/on-off-road bike, SUV, 4x4, UTV
record limited rides per month
save a small number of favorite trails
basic ride stats: distance, duration, speed, elevation
upload a few photos
basic community feed

Paid tier

unlimited ride tracking
offline maps
offline saved regions/trails
advanced route planning
private trails and private groups
GPX import/export
hazard markers, closures, trail condition reports
higher media limits
family/group live sharing later
maybe land ownership overlays later, if you can license the data
This structure matches how proven outdoor apps gate value: core discovery is free, serious utility is paid. onX currently uses a multi-tier model with trial access and paid annual plans.

Your biggest strategic advantage should not be “clone onX.” It should be:

better support for all off-road classes, not just one core audience
better community trail contributions
better ride journaling and sharing
easier beginner experience
stronger local club/community features
eventually better event/trip planning

That gives you a real wedge. onX is strong on mapping and land/trail data; you can win on community + simplicity + multi-vehicle identity.

The stack I would choose for you

Frontend/app builder: FlutterFlow
Reason: it is built for fast cross-platform app creation and lets you visually build an iPhone and Android app from one project, while still allowing custom code later.

Backend: Supabase
Reason: you need auth, database, storage for photos, and realtime/community features. Supabase covers all of that in one place.

Maps/offline: Mapbox
Reason: your app lives or dies on maps and offline use. Mapbox’s mobile SDKs support interactive maps and offline map downloads on mobile.

Subscriptions: RevenueCat
Reason: subscriptions across iOS and Android are annoying to implement directly. RevenueCat exists to simplify StoreKit and Google Play Billing and sync subscription state across platforms.

What your database should roughly look like

You do not need to code this yet, but you should design these tables:

users
profiles
vehicle_classes
rides
ride_points (GPS track points)
trails
trail_segments
trail_photos
trail_reviews
trail_conditions
favorites
subscriptions
clubs/groups
reports (hazards, closures, illegal access, etc.)

This structure lets you separate:

a user’s personal ride recording
official/community trail objects
community moderation/reporting
premium access control
The hardest parts of this app

These are the parts most first-time founders underestimate:

1. GPS quality and battery use
Tracking rides in the background while preserving battery is hard.

2. Offline mapping
This is not optional for off-road use. It is core product value. Mapbox explicitly supports offline map workflows, which is why I would not compromise here.

3. Trail data quality
The app is only as good as the data. You need a clear process for:

user-submitted trails
moderation
duplicates
private land / restricted areas
temporary closures
trail difficulty ratings

4. Safety and liability
People will use this app in remote places. You need clear disclaimers, reporting tools, and a moderation workflow.

5. Subscription gating
The paywall must be simple. Do not invent your own billing logic when App Store / Play / RevenueCat already solve that.

A realistic build plan for you

Month 1: define the product

choose app name
write one-sentence pitch
define free vs paid
choose 1 target user first: dirt bike rider, ATV rider, or 4x4/SUV explorer
sketch 8 core screens

Month 2: build prototype in FlutterFlow

onboarding
login
home map
trail details
record ride
profile
save trail
subscription/paywall

Month 3: connect backend

Supabase auth
rides table
trails table
photo uploads
comments/reviews
basic admin moderation

Month 4: maps + subscription

Mapbox integration
ride recording
offline saved regions
RevenueCat paywall and entitlement checks

Month 5: private beta

20–50 real riders test it
collect bugs
fix crashes
remove weak features
improve onboarding

Month 6: publish

App Store listing
Play Store listing
subscription products
screenshots
privacy policy
terms
support email

To publish, you will need an Apple Developer Program membership and App Store Connect for Apple distribution, and a Google Play Console developer account for Android distribution. Apple’s official docs say App Store Connect is where you upload, submit, test, and manage apps; Google’s Play Console docs cover account setup and app publishing.

Do this before building anything

Write these 5 decisions down first:

1. Who is version 1 for?
Pick one:

dirt bikes
ATV/UTV
4x4/SUV

Do not start with all of them equally.

2. What is the one killer feature?
Examples:

best community dirt bike trails
easiest off-road ride recorder
best beginner-friendly off-road planning app
best multi-vehicle off-road explorer

3. What is free and what is paid?
Keep this brutally simple.

4. What data is public vs private?
A rider may want private rides, private start points, and hidden camps.

5. What is your moderation policy?
You must decide how community trails get approved and how dangerous/illegal routes get removed.

My strongest advice

Do not start by trying to build:

landowner overlays
advanced 3D
social messaging
live group tracking
marketplace
event system
too many vehicle types with unique rules

Start with:

map
record ride
save trail
community uploads
filters by vehicle class
subscription

That is the product.

Best next move

Your next step should be to create a one-page product blueprint with:

app name
target user
10 MVP features
free vs paid features
screen list
recommended stack

I can make that blueprint for your app right now and structure it so you can start building in FlutterFlow immediately.