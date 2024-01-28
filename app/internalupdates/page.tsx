export default function InternalUpdate() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-3xl">
            <div role="alert" className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>PLEASE LOG OUT AND BACK IN IF YOU HAVENT ON THIS NEW VERSION. I updated some of the cookie data and things wont work until you log out and back in!</span>
            </div>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                <article className="prose">
                    <h1>1/28/2024</h1>
                    <p>
                        Latest Updates add basic profile and stat pages as well as some fixes accross the board. araiti.com will also be usable now without needing the 3000 port number and will be up 24/7.
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
