/* Kick chat control. ZTV reads kick.com/simplezombie chat anonymously, so no login is needed.
   Chat commands: !ch 13   !ch mixtape   !next   !prev   !random   !whatson   !whatson 13

   chatroomId: Kick chat runs on a numbered chatroom, not the channel name. To find yours:
     1. Open https://kick.com/api/v2/channels/simplezombie in your browser
     2. Find  "chatroom":{"id":12345678  and put that number below (use the one inside "chatroom",
        not the first "id" at the top). It never changes.
   You can also test without editing this file: open the page with ?room=12345678&chan=1234567 on the end.
   Press F on the page (or a mod types !testfollow in chat) to preview the follow alert. */
var KICK={
  enabled:true,
  channel:"simplezombie",
  chatroomId:69039,      // <-- put your chatroom number here
  channelId:69041,       // <-- for follow alerts: the FIRST "id" at the very top of that same page (not the chatroom one)
  who:"everyone",     // "everyone" or "mods" (moderators and you)
  cooldown:10,        // seconds between commands from regular viewers (mods skip it)
  follows:true,       // new follower alert in the top bar
  followSecs:7,       // how long each alert stays up
  followCount:true,   // show the follower total in the top bar
  // Kick's chat service. ZTV asks Kick for the current key when it can and falls back to this one.
  // Kick changed it in October 2026 (old key: 32cbd69e4b950bf97679). If chat says RETRYING forever, the key changed again.
  pusherKey:"34bf7a0ff419a2a775b9",
  pusherCluster:"us2"
};
