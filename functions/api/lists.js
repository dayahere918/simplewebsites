// /api/lists
// Handles fetching all user lists, creating a new list, or voting on an item

export async function onRequestGet(context) {
    const { env } = context;
    if (!env || !env.RANK_KV) {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const listKeys = await env.RANK_KV.list({ prefix: 'list:' });
        const lists = [];
        for (const key of listKeys.keys) {
            const data = await env.RANK_KV.get(key.name, { type: 'json' });
            if (data) lists.push(data);
        }
        
        // Sort lists by creation date or just return
        return new Response(JSON.stringify(lists), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    if (!env || !env.RANK_KV) {
        return new Response(JSON.stringify({ error: 'KV not configured. Add RANK_KV binding.' }), { status: 500 });
    }

    try {
        const body = await request.json();
        const action = body.action || 'create';

        if (action === 'vote') {
            const { listId, itemId, direction } = body;
            const listKey = `list:${listId}`;
            const listData = await env.RANK_KV.get(listKey, { type: 'json' });
            
            if (!listData) return new Response(JSON.stringify({ error: 'List not found' }), { status: 404 });

            const item = listData.items.find(i => i.id === itemId);
            if (item) {
                if (direction === 'up') item.votes = (item.votes || 0) + 1;
                if (direction === 'down') item.votes = (item.votes || 0) - 1;

                // Sort items by vote descending
                listData.items.sort((a, b) => (b.votes || 0) - (a.votes || 0));

                await env.RANK_KV.put(listKey, JSON.stringify(listData));
                return new Response(JSON.stringify({ success: true, list: listData }), { headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });

        } else if (action === 'create') {
            const listId = Date.now().toString(36) + Math.random().toString(36).substring(2);
            const newList = {
                id: listId,
                name: body.name || 'Untitled Content',
                items: (body.items || []).map((name, i) => ({ 
                    id: i.toString() + '_' + Date.now().toString(36), 
                    name: name.trim() || 'Unknown', 
                    votes: 0 
                }))
            };

            await env.RANK_KV.put(`list:${listId}`, JSON.stringify(newList));
            return new Response(JSON.stringify({ success: true, list: newList }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
