export default function InternalUpdate() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-3xl">
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
            </div>
          </div>
    );
}
