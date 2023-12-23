module.exports = async (kadaiItem) => {
    try {
        const URL = kadaiItem.classInfo.webhook;

        //送信するデータ
        const postData = {
            username: `宿題通知BOT - ${kadaiItem.classId}`,
            content: `「${kadaiItem.title}」がそろそろ提出期限です。順調でしょうか \n${kadaiItem.url}`
        }
    
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        
        return response;
    } catch (error) {
        throw new Error(error);
    }
}