let agentData = [];
let weaponData = [];
let dataPromise = null;

async function fetchData() {
    if (dataPromise) return dataPromise;

    dataPromise = (async () => {
        const [agentsResponse, weaponsResponse] = await Promise.all([
            fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true'),
            fetch('https://valorant-api.com/v1/weapons')
        ]);

        if (!agentsResponse.ok || !weaponsResponse.ok) {
            throw new Error('Failed to fetch Valorant API data.');
        }

        const [agentsData, weaponsData] = await Promise.all([
            agentsResponse.json(),
            weaponsResponse.json()
        ]);

        agentData = (agentsData.data || []).filter(agent => agent && agent.displayName);
        weaponData = (weaponsData.data || []).filter(weapon => weapon && weapon.displayName && weapon.shopData);
        
    })().catch((error) => {
        console.error('Valorant data load failed:', error);
        agentData = [];
        weaponData = [];
        dataPromise = null;
        throw error;
    });

    return dataPromise;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchData();
    } catch (_) {
        alert('Could not load game data. Please refresh the page.');
    }
});

async function randomizeAgent() {
    await fetchData();
    if (agentData.length === 0) return;

    const agent = agentData[Math.floor(Math.random() * agentData.length)];

    document.getElementById('agentResult').innerHTML = `
        <h2>${agent.displayName}</h2>
        <img src="${agent.displayIcon}" alt="${agent.displayName}" class="agent-image">
    `;
}

async function randomizeWeapon() {
    await fetchData();

    let budget = Number(document.getElementById('budget').value);
    budget = isNaN(budget) ? 0 : budget;

    const filteredWeapons = weaponData.filter(
        weapon => weapon.shopData.cost <= budget
    );

    console.log(filteredWeapons, budget);

    if (filteredWeapons.length === 0) return;

    const weapon = filteredWeapons[Math.floor(Math.random() * filteredWeapons.length)];

    document.getElementById('weaponResult').innerHTML = `
        <h2>${weapon.displayName} - Cost: ¤${weapon.shopData.cost}</h2>
        <img src="${weapon.displayIcon}" alt="${weapon.displayName}" class="weapon-image">
    `;
}

async function randomizeAll() {
    await randomizeAgent();
    await randomizeWeapon();
}
