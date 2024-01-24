export default function InternalUpdate() {
    return (
        <div className="flex-col justify-start items-center min-h-screen bg-base-200 mx-auto max-w-3xl">
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
