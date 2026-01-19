export default function InternalUpdate() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-3xl">
            {/* <div role="alert" className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>PLEASE LOG OUT AND BACK IN IF YOU HAVENT ON THIS NEW VERSION. I updated some of the cookie data and things wont work until you log out and back in!</span>
            </div> */}
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <article className="prose pl-5 pb-5">
                        <h1>1/19/2025</h1>
                        <h2>Exporting To Tabletop Simulator</h2>
                        <p>
                            New deck exporting page lets you choose art for each card and your cardbacks then export for TTS.
                        </p>

                        <h3>How to Export to TTS: </h3>
                        <li>{`Navigate to the deck details page (where you edit your decks commander and image)`}</li>
                        <li>{`There is a new button there for "Export to TTS" which will take you to the export page`}</li>
                        <li>{`At the top you can change the card back by providing a url in the input (the preview window will show if the url works)`}</li>
                        <li>{`You can click on a card to open a window to select a new style for it.`}</li>
                        <li>{`Once completed, click export at the top to download the deck json.`}</li>
                        
                        <p>{`Exporting will also open a window which will allow you to download your cardback image. This image will need to be placed alongside your deck in the TTS saved objects directory if you want a working icon in the TTS object browser`}</p>
                    </article>
                </div>
            </div>
            {/* <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <article className="prose">
                        <h1>3/2/2025</h1>
                        <h2>Library Upgrades and Styling</h2>
                        <p>
                            Upgraded libraries to be up to date. There was a big update to the styling library used so there might be bugs or missed visual issues with that.
                        </p>
                        <h3>In this update: </h3>
                        <p>Additions and Reworks:</p>
                        <li>Card image popup on hover of decklist item</li>
                        
                        <p>Fixes:</p>
                        <li>Checkbox filtering somehow wasnt included or something, fixed now</li>
                        <li>Theme resources used throughout website changed. this will make future theme additions easier and make more sense</li>

                        <h2>Future Plans</h2>
                        <p>A lot on the backburner right now. Optimizing the stat endpoints more and adding more stats to the site is what im leaning toward next.</p>

                    </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <article className="prose">
                        <h1>2/12/2025</h1>
                        <h2>First update of the year</h2>
                        <p>
                            Some small fixes and changes
                        </p>
                        <h3>In this update: </h3>
                        <p>Additions and Reworks:</p>
                        <li>Deck color filters</li>
                        <li>Added average kills per game column on user stats</li>
                        <li>Card redirects on card stat table</li>
                        
                        <p>Fixes:</p>
                        <li>Fixed typo in quickstart</li>
                        <li>Fixed rumble banner image issue on stat page</li>

                        <h2>Future Plans</h2>
                        <p>Same large list of options but I have been slowly planning on deck versioning as the potential next big change.</p>
                        <p>I have also been thinking over MVP card voting, not sure if that would actually be a good change or just end up ruined by meme votes but its an easy enough addition so its on the table.</p>

                    </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <article className="prose">
                        <h1>12/17/2024</h1>
                        <h2>Its been a minute...</h2>
                        <p>
                            With the site in working order for weekly events I had taken a good break from working on new things. There were definitely some needed fixes though and we have those and some cleanup for this update. I have a lot of other future items from people I will be looking into as well.
                        </p>
                        <h3>In this update: </h3>
                        <p>Additions and Reworks:</p>
                        <li>Spinner when uploading a deck</li>
                        <li>Added button on deck editing page to goto the decklist page</li>
                        <li>Decklist page rework. Added sections for clarity</li>
                        <li>Added copy to clipboard button on decklist page</li>
                        <li>Added Steal button to decklist page. See below.</li>
                        <li>Added ability to create a new user from the profile tab if you are an admin.</li>
                        <p>Fixes:</p>
                        <li>Fixes to regex and deck creation logic that went overlooked</li>

                        <h2>Deck Upload Spinner</h2>
                        <p>Really simple right now but will give better clarity when a new deck is submitted that things are cookin behind the scenes. right now theres still no error feedback if things go wrong but that might come in a later update. Right now if you have issues uploading you can always goto the decklist and see what cards are missing. And when in doubt try uploading your deck to a different site to try and get different formatting.</p>
                        
                        <h2>Decklsit Page Rework: Stealing and Copying</h2>
                        <p>I really wanted to cleanup the decklist page because it was a quick toss in before but had more potential. As long as you are logged in you can view anyones decklist by clicking on their commander picture in a match, or just have them link it to you. In the future I plan on adding full deck browsing as well.</p>
                        <p>Stealing is something that I wish I added a while back but as we have had new players and also some players not ready for theme nights we have needed better deck sharing. The steal button on a decklist page simply makes a copy of that deck to your account. So whether you are helping someone new or just want to use someones own deck against them, stealing is now here for you.</p>
                        <p>Copying to clipboard is also there which will allow you to easily grab a decklist for you to upload to another site or quickly edit and upload for yourself.</p>
                        <p>A small PSA as well, if you were using the CMDR tag when uploading your decks it might have flagged way more than one card as your commander. I will be fixing this sometime in the future but your decklist will look messed up for a little bit</p>
                        <h2>Admin: User Creation</h2>
                        <p>Since we have been getting new users more frequently I also added in the ability for admin users to create a new user on the fly. Currently only Ship and I are admins as I dont know how far I want to go with permissions yet.</p>
                        <p>This in culmination with deck stealing should make new user intake significantly faster and easier than before.</p>

                        <h2>Bug Fixes</h2>
                        <p>Fun fact the regex we had for the deck uploader was barely working and the logic for CMDR tags was messed up. Both these things have been fixed now I even rewrote the whole upload logic so hopefully no more issues with that.</p>

                        <h2>Future Plans</h2>
                        <p>Theres a lot of directions to go from here i have around 50 items on my trello board if I had to guess. Right now Im going to just add things as they seem important to people playing so if you want something reasonable just be vocal to keep it on my mind.</p>
                        <p>Currently planned for the future: </p>
                        <li>Deck versioning. This is a big one so I keep putting it off but it will most likely be the next big addition for the site</li>
                        <li>Deck browsing. This alone is fairly small but I want to redesign the deck page a bit with it.</li>
                        <li>Importing decks from URLs. Realistically this wont save a ton of time but its a huge QOL thing and might help with confusion for newer players.</li>
                        <li>More stats. Stats were the main reason for tracking these things and I really want to cram more in, the current setup is just not super condusive for this though so im trying to figure out what I want to add.</li>
                        <p>I dont have a set order for working on the above list so again the more vocal party will probably get picked first</p>

                        <h3>Final note</h3>
                        <p>I dont expect pretty much anyone to read this far or all of this but if for some reason you did hi and thanks. Trying out a longer format this time for the update to get a bit more explanation in on things so I hope it might help? I have no clue when the next update will be, but hopefully I make it a good one. </p>
                        <p>peace ✌️</p>
                    </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>3/31/2024</h1>
                    <p>
                        Deck Image Selection. Stats theme toggle. Various backend cleanups. (Also please re-login)
                    </p>
                    <h2>Deck Image Selection</h2>
                    <p>
                        Now on your deckinfo page you will be able to see your deck image and select any of the alternate art images for your commander to use as your deck image.
                    </p>
                    <h2>Stats theme toggle</h2>
                    <p>
                        Previously the stat pages were including themed night stats by default. Now there is a toggle to include that data but by default it will only be normal nontheme data.
                    </p>
                    <h2>Other stuff</h2>
                    <p>- Added api info to cookie data so please re-login. Eventually trying to better handle cookie issues but thats future stuff.</p>
                    <p>- Cleaned up some old code</p>
                    <p>- Added caching for public endpoints to avoid some bad stuff</p>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>3/27/2024</h1>
                    <p>
                        Banlist endpoints. Watchlist added to banlist. Match power selection added. Various fixes.
                    </p>
                    <h2>Match Power Selction</h2>
                    <p>
                        Now on the left of a match title there will be a button for a dropdown menu. Currently the only thing in this menu will be the ability to specify a matches power (normal, casual, competitive).
                        Hopefully this will help tag matches and allow us to get more insight in the future on certain cards impact accross the different play types.
                    </p>
                    <h2>Banlist endpoints / Watchlist Added to Banlist Page</h2>
                    <p>
                        The public banlist page now pulls from the api for both the banlist and watchlist to allow realtime updates. Future plans are to add more reasoning and info to each card as well.
                    </p>
                    <h2>Fixes</h2>
                    <p>- Some random links</p>
                    <p>- Some time display stuff</p>
                    <p>- Yorion companion legality issue</p>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>3/20/2024</h1>
                    <p>
                        Deck page addition. Various fixes and backend upgrades.
                    </p>
                    <h2>Deck Display Page</h2>
                    <p>
                        Now clicking on the deck/commander image in the match screen will bring you to a page for the decklist. The commander is highlighted and any watchlist cards are indicated with a yellow logo.
                        Future plans to make this publicly accessible for people not logged in as well as sortable/searchable etc.
                    </p>
                    <h2>Switched to Oracle IDs</h2>
                    <p>
~                        Cards are now using scryfall oracle ids -which we shouldve from the start-. This was a rough conversion to do so let me know if theres anything weird with cards or commanders.
                         This also led to the creation of the new Printing table which will internally let us store different card print options and in the future let you decide which print is displayed for your cards/deck etc
                    </p>
                    <h2>Fixes</h2>
                    <p>- I think timer is fixed</p>
                    <p>- Only legendary creatures/walkers selectable for commander/partner/companion now. hopefully this helps with selection</p>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>2/24/2024</h1>
                    <p>
                        Various fixes. Change to ability for historical match edits.
                    </p>
                    <h2>Historical Match Edits</h2>
                    <p>
                        Any match that happened over 24 hours in the past will require an admin to edit now. This is just to avoid any accidental edits to old events when viewing.
                    </p>
                    <h2>Fixes</h2>
                    <p>- Deck details page will update properly when edits are made</p>
                    <p>- Match timer minutes will display properly when above an hour</p>
                    <p>- Sideboard cards will display properly on deck details page</p>
                    <p>- Added back restriction of needing to end match to select first place</p>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>1/28/2024</h1>
                    <p>
                        Latest Updates add basic profile and stat pages as well as some fixes accross the board. 
                        araiti.com will also be usable now without needing the 3000 port number and will be up 24/7.
                        We will be using this domain until the site is full ready to switch to.
                    </p>
                    <h2>Profile Page</h2>
                    <p>
                        If you click on your name when logged in you now goto your profile page. Right now you are just able to change your password (please use carefully i dont want to have to keep reseting passwords for people)
                    </p>
                    <h2>Stats Pages</h2>
                    <p>
                        Ive started on the stats (kinda). For right now you can goto the stats tab and see some basic user stats for yourself. 
                        The side nav doesnt work yet but will be hooked up since we will have stat pages for all different types of things in the future.
                        IF YOUR STATS PAGE ISNT LOADING RE-LOG OUT AND IN. I upgraded the cookie data and youll need to re-login to get it to work
                    </p>
                    <h2>Fixes</h2>
                    <p>- Matches will now auto select who goes first</p>
                    <p>- Dropdown to add users to matches should work now (ive also added a join me button to shortcut adding yourself)</p>
                </article>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>New Rumble Site 2.0</h1>
                    <p>
                        Welcome to the new Official Rumble Website. This specific url will be used to dump info on internal updates for us weekly players (if you are not a weekly player this will be boring)
                        As you can see theres a good amount of changes just from the visual end but a few more to note on the user side.
                    </p>
                    <h2>Support For NON-Weekly events</h2>
                    <p>
                        This is something I hope will encourage some games and data outside of Wednesdays. When creating a new event on the events page there will no be a modal popup with settings to fill.
                        There you can toggle Weekly off. Essentially that just means the matches are played not on our normal wednesday night magic. This will allow people to make events and play some pickup rumble whenever they want.
                    </p>
                    <h2>Less Logging In!</h2>
                    <p>
                        Ive added a remember me button to the login page. If unchecked your cookie will go away whenever the browser closes, so youll have to login each time.
                        If you select remember me, your login will remain stored for 90 days, I might change this in the future since I dont like tokens out that long but should be fine for now.
                    </p>
                    <h2>Banlist Page Re-Imagining</h2>
                    <p>
                        I reworked the banlist page to make it a bit cleaner and searchable. The hover is broken for now but everything else works. 
                        I have some other plans like displaying mana costs and ban reasonings but this is a cleaner first step to that.
                    </p>
                    <h2>Much More On The Way</h2>
                    <p>
                        This is just the entry setup and much of it is more programmer art than I want. The new structure will allow for faster dev and is more enjoyable to use on my end.
                        Some things I have coming next are:
                    </p>
                    <p>- Public end pages overhaul (cleaning up and adding more to the homepage, banlist, and rulespage)</p>
                    <p>- User Profile Page. Allowing you to change password and start using profile pictures.</p>
                    <p>- Stats page. This will have subpages for different categories but will start to let everyone get a good idea on how the numbers look</p>
                </article>
                </div>
            </div> */}
          </div>
    );
}
