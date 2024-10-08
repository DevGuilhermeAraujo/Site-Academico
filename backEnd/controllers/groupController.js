import App from '../app.js'; // Atualize o caminho conforme necessário


// Função usada para pegar todos os grupos registrados no banco de dados
const getAllGroups = async (req, res) => {
    try {
        const groups = await App.group.getAllGroups();
        res.json(groups);
    } catch (error) {
        res.status(500).send('Error fetching groups');
    }
};



// Função usada para 
const getGroupsData = async (req, res) => {
    const { screenId } = req.params;

    try {
        // Fetch both available and linked groups
        const availableGroups = await App.screen.getAvailableGroups(screenId);
        const linkedGroups = await App.screen.getLinkedGroups(screenId); 
        // Send both sets of data in one response
        res.json({
            availableGroups,
            linkedGroups
        });
    } catch (error) {
        console.error('Erro ao buscar dados dos grupos:', error);
        res.status(500).send('Erro ao buscar dados dos grupos');
    }
};



// Endpoint para vincular grupos a uma tela
const linkGroups = async (req, res) => {
    const { screenId, addedGroups, removedGroups } = req.body;

    console.log(req.body);

    try {
        // Adiciona os grupos vinculados
        if (addedGroups.length > 0) {
            await App.screen.addGroupsToScreen(screenId, addedGroups);
        }

        // Remove os grupos vinculados
        if (removedGroups.length > 0) {
            await App.screen.removeGroupsFromScreen(screenId, removedGroups);
        }

        res.json({ success: true, message: 'Grupos vinculados com sucesso' });
    } catch (error) {
        console.error('Erro ao vincular grupos:', error);
        res.status(500).send('Erro ao vincular grupos');
    }
};

// Endpoint para obter grupos disponíveis para vinculação
const getAvailableGroups = async (req, res) => {
    const { screenId } = req.params;
    try {
        const availableGroups = await App.permission.getAvailableGroups(screenId);
        res.json(availableGroups);
    } catch (error) {
        res.status(500).send('Error fetching available groups');
    }
};

// Endpoint para obter grupos já vinculados a uma tela
const getLinkedGroups = async (req, res) => {
    const { screenId } = req.params;
    try {
        const getLinkedGroups = await App.permission.getLinkedGroups(screenId);
        res.json(getLinkedGroups);
    } catch (error) {
        res.status(500).send('Error fetching linked groups');
    }
};




const getGroupDetails = async (req, res) => {
    const { groupId } = req.params;
    try {
        // Chama as funções para obter telas e usuários
        const groupScreensResponse = await App.group.getGroupScreens(groupId);
        const groupUsersResponse = await App.group.getGroupUsers(groupId);

        // Verifica se a resposta foi bem-sucedida
        if (!groupScreensResponse.success || !groupUsersResponse.success) {
            return res.status(500).send('Error fetching group details');
        }

        // Extrai os dados dos resultados
        const groupScreens = groupScreensResponse.result || [];
        const groupUsers = groupUsersResponse.result || [];

        // Verifica se os dados foram retornados corretamente
        if (!Array.isArray(groupScreens) || !Array.isArray(groupUsers)) {
            return res.status(500).send('Error processing group details');
        }

        // Estrutura os dados no formato desejado
        const result = [
            groupScreens.map(screen => ({
                id: screen.screenId,
                nome: screen.screenName
            })),
            groupUsers.map(user => ({
                id: user.userId,
                nome: user.userName
            }))
        ];

        // Envia a resposta como JSON
        res.json(result);
    } catch (error) {
        console.error('Erro ao buscar detalhes do grupo:', error);
        res.status(500).send('Error fetching group details');
    }
};



export default {
    getAllGroups,
    getGroupsData,
    getAvailableGroups,
    linkGroups,
    getLinkedGroups,
    getGroupDetails
}