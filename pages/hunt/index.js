const $ = (e) => document.getElementById(e);
const userDetails = $("userDetails");
const headshot = $("headshot");
const cards = $("cards");
const count = $("count");
const name = $("name");
const hub = $("hub")
const id = $("id");

const normalizeName = (name) => name.toLowerCase().replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

const userInfo = async (username) => {
    const user = {}
    const details = await axios.post(`/users`, { usernames: [username], excludeBannedUsers: false });
    if (!details.data.data[0]) return null;
    user.id = details.data.data[0].id;
    user.name = details.data.data[0].name;
    user.displayName = details.data.data[0].displayName;
    const image = await axios.get(`/thumbnail?id=${user.id}`);
    user.imageUrl = image.data.data[0].imageUrl;
    return user;
};

const parseIDs = async (userId, ids) => {
    const results = [];
    const getIndexById = (id) => results.findIndex((badge) => badge.id === id);
    await Promise.all(ids.map((id) => new Promise(async (resolve) => {
        await axios.get(`/badges/${id}`)
            .then((response) => {
                results.push(response.data);
                resolve();
            })
            .catch((err) => {
                console.error(`Failed to fetch badge ${id}:`, err);
                resolve();
            });
    })));
    const badges = await axios.get(`/dates/${userId}?ids=${ids.join(",")}`);
    console.log(badges.data);
    await Promise.all(badges.data.data.map((badge) => {
        const i = getIndexById(badge.badgeId);
        if (!isNaN(i)) results[i].owned = true;
    }));
    return results;
};
const parseResults = (results, element, title, useBadgeName) => {
    const owned = [];
    const notOwned = [];
    if (results.length === 0) return
    for (const badge of results) {
        if (badge.owned) {
            owned.push(`<a class="true" ${useBadgeName ? `href="https://www.roblox.com/badges/${badge.id}/">${`${owned.length + 1}`}. ${normalizeName(badge.name)}` : `href="https://www.roblox.com/games/${badge.awardingUniverse.rootPlaceId}/">${`${owned.length + 1}`}. ${normalizeName(badge.awardingUniverse.name)}`}</a>`);
        } else {
            notOwned.push(`<a class="false" ${useBadgeName ? `href="https://www.roblox.com/badges/${badge.id}/">${`${notOwned.length + 1}`}. ${normalizeName(badge.name)}` : `href="https://www.roblox.com/games/${badge.awardingUniverse.rootPlaceId}/">${`${notOwned.length + 1}`}. ${normalizeName(badge.awardingUniverse.name)}`}</a>`);
        };
    };
    console.log(results);
    console.log(owned);
    console.log(notOwned);
    $(element).innerHTML = `<b>${title || `${element} tokens`} (${Math.floor((owned.length / results.length) * 100)}% | ${owned.length}/${results.length}):</b><br>${owned.length > 0 ? `${notOwned.length > 0 ? 'owned:<br>' : ''}${owned.join('<br>')}` : ''}${notOwned.length > 0 ? `${owned.length > 0 ? '<br><br>not owned:<br>' : ''}${notOwned.join("<br>")}` : ''}`;
};
let debounce = false;
count.addEventListener("click", async () => {
    if (debounce) return;
    debounce = true;
    headshot.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    const username = id.value;
    if (!username) return alert("please insert an username!");
    count.disabled = true;
    id.disabled = true;
    id.placeholder = "loading...";
    id.value = "";
    userDetails.style.display = "none";
    cards.style.display = "none";

    const user = await userInfo(username);
    if (!user) { 
        alert("please insert a valid username!");
        id.placeholder = "insert an username";
        count.disabled = false;
        id.disabled = false;
        debounce = false;
        return;
    };
    id.placeholder = "loading... (25%)";
    const hubBadgesRequest = await parseIDs(user.id, hubBadges);
    id.placeholder = "loading... (50%)";
    const regularTokensRequest = await parseIDs(user.id, regularTokens);
    id.placeholder = "loading... (75%)";
    const megaTokensRequest = await parseIDs(user.id, megaTokens);
    id.placeholder = "loading... (100%)";

    cards.style.display === "flex";
    userDetails.style.display = "block";
    userDetails.href = `https://www.roblox.com/users/${user.id}/profile`;
    headshot.src = user.imageUrl;
    name.innerHTML = `${user.displayName}<br>(@${user.name})`;
    cards.style.display = "flex";
    parseResults(hubBadgesRequest, "hub", "<a href='https://www.roblox.com/games/124180448122765/The-Hunt-Mega-Edition'>hub badges</a>", true);
    parseResults(regularTokensRequest, "regular");
    parseResults(megaTokensRequest, "mega");
    
    id.placeholder = "insert an username";
    count.disabled = false;
    id.disabled = false;
    debounce = false;
});