import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layout/Layout";
import { Tabs, Tab, Button } from "react-bootstrap";
import CustomModal from "../../components/modal/CustomModal";
import "./AccessManagement.css";

const AccessManagement = () => {
  const [screens, setScreens] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false); // Novo estado
  const [selectedScreenId, setSelectedScreenId] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [linkedGroups, setLinkedGroups] = useState([]);
  const [selectedAvailableGroups, setSelectedAvailableGroups] = useState([]);
  const [selectedLinkedGroups, setSelectedLinkedGroups] = useState([]);

  const [initialLinkedGroups, setInitialLinkedGroups] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:3001/api/permissions/getScreens')
      .then(response => setScreens(response.data))
      .catch(error => console.error('Erro ao buscar telas:', error));

    axios.get('http://localhost:3001/api/groups/getGroups')
      .then(response => setGroups(response.data))
      .catch(error => console.error('Erro ao buscar grupos:', error));
  }, []);

  const handleCreateGroup = () => {
    alert('Criar novo grupo');
  };

  const handleGroupDetails = (groupId) => {
    setSelectedGroup(groupId);
    axios.get(`http://localhost:3001/api/groups/group-details/${groupId}`)
      .then(response => {
        const [telas, membros] = response.data;
        setGroupDetails({ telas, membros });
        setShowGroupDetailsModal(true); // Abre o modal de detalhes do grupo
      })
      .catch(error => console.error('Erro ao buscar detalhes do grupo:', error));
  };

  const handleLinkGroups = (screenId) => {
    setSelectedScreenId(screenId);
    setShowModal(true);
    fetchGroupsData(screenId);
  };

  const fetchGroupsData = (screenId) => {
    axios.get(`http://localhost:3001/api/groups/getGroupsData/${screenId}`)
      .then(response => {
        const { availableGroups, linkedGroups } = response.data;
        setAvailableGroups(availableGroups);
        setLinkedGroups(linkedGroups);
        setInitialLinkedGroups(linkedGroups); // Armazena o estado inicial dos grupos vinculados
      })
      .catch(error => console.error('Erro ao buscar dados dos grupos:', error));
  };

  const handleCheckboxChange = (groupId, type) => {
    if (type === 'available') {
      setSelectedAvailableGroups(prev =>
        prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
      );
    } else {
      setSelectedLinkedGroups(prev =>
        prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
      );
    }
  };

  const moveToLinked = () => {
    setLinkedGroups(prev => [
      ...prev,
      ...availableGroups.filter(group => selectedAvailableGroups.includes(group.id))
    ]);
    setAvailableGroups(prev => prev.filter(group => !selectedAvailableGroups.includes(group.id)));
    setSelectedAvailableGroups([]);
  };

  const moveToAvailable = () => {
    setAvailableGroups(prev => [
      ...prev,
      ...linkedGroups.filter(group => selectedLinkedGroups.includes(group.id))
    ]);
    setLinkedGroups(prev => prev.filter(group => !selectedLinkedGroups.includes(group.id)));
    setSelectedLinkedGroups([]);
  };

  const handleSave = async () => {
    const addedGroups = linkedGroups.filter(group => !initialLinkedGroups.some(initialGroup => initialGroup.id === group.id));
    const removedGroups = initialLinkedGroups.filter(initialGroup => !linkedGroups.some(group => group.id === initialGroup.id));

    const payload = {
      screenId: selectedScreenId,
      addedGroups: addedGroups.map(group => group.id),
      removedGroups: removedGroups.map(group => group.id),
    };

    try {
      const response = await axios.post('http://localhost:3001/api/groups/linkGroups', payload);
      if (response.data.success) {
        console.log('Grupos atualizados com sucesso');
        setShowModal(false);
      } else {
        console.error('Falha ao atualizar grupos:', response.data.message);
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAvailableGroups([]);
    setSelectedLinkedGroups([]);
  };

  const handleCloseGroupDetailsModal = () => {
    setShowGroupDetailsModal(false);
    setGroupDetails(null);
  };

  return (
    <Layout sidebarType="" showBackButton={true} previousPage="/home">
      <div className="access-management-container">
        <h2>Gerenciamento de Acessos</h2>
        <Tabs className="access-management-tabs" defaultActiveKey="telas">
          <Tab eventKey="telas" title="Telas">
            <div className="screens-list">
              <h3>Listagem de Telas</h3>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {screens.map(screen => (
                    <tr key={screen.id}>
                      <td>{screen.id}</td>
                      <td>{screen.nome}</td>
                      <td>
                        <Button variant="secondary" onClick={() => handleLinkGroups(screen.id)}>Segurança</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab>
          <Tab eventKey="grupos" title="Grupos">
            <div className="form-actions">
              <Button variant="primary" onClick={handleCreateGroup}>Criar Novo Grupo</Button>
            </div>
            <div className="groups-list">
              <h3>Grupos e Detalhes</h3>
              {groups.length === 0 ? (
                <p>Nenhum grupo encontrado.</p>
              ) : (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <tr key={group.id}>
                        <td>{group.id}</td>
                        <td>{group.nome}</td>
                        <td>
                          <Button variant="info" onClick={() => handleGroupDetails(group.id)}>Detalhes</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Modal para gerenciar grupos de acesso */}
        <CustomModal
          show={showModal}
          onHide={handleCloseModal}
          title="Gerenciar Grupos de Acesso"
          children={(
            <div className="modal-body-content">
              <div className="groups-management">
                <div className="available-groups">
                  <h5>Grupos Disponíveis</h5>
                  <ul>
                    {availableGroups.map(group => (
                      <li key={group.id}>
                        <input
                          id={`checkbox-${group.id}`}
                          type="checkbox"
                          checked={selectedAvailableGroups.includes(group.id)}
                          onChange={() => handleCheckboxChange(group.id, 'available')}
                          style={{ marginRight: '10px' }}  // Espaçamento entre o checkbox e o texto
                        />
                        <label htmlFor={`checkbox-${group.id}`}>
                          {group.nome}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="link-groups-actions">
                  <button className="arrow-button" onClick={moveToLinked}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <button className="arrow-button" onClick={moveToAvailable}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </div>

                <div className="linked-groups">
                  <h5>Grupos Vinculados</h5>
                  <ul>
                    {linkedGroups.map(group => (
                      <li key={group.id}>
                        <input
                          id={`checkbox-linked-${group.id}`}
                          type="checkbox"
                          checked={selectedLinkedGroups.includes(group.id)}
                          onChange={() => handleCheckboxChange(group.id, 'linked')}
                          style={{ marginRight: '10px' }}  // Espaçamento entre o checkbox e o texto
                        />
                        <label htmlFor={`checkbox-linked-${group.id}`}>
                          {group.nome}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          footerContent={(
            <div className="modal-footer">
              <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave}>Salvar</Button>
            </div>
          )}
        />

        {/* Modal para exibir detalhes do grupo */}
        <CustomModal
          show={showGroupDetailsModal}
          onHide={handleCloseGroupDetailsModal}
          title="Detalhes do Grupo"
          children={(
            <div className="modal-body-content">
              {groupDetails ? (
                <>
                  <h4>Membros do Grupo</h4>
                  <ul>
                    {groupDetails.membros.map(member => (
                      <li key={member.id}>{member.nome}</li>
                    ))}
                  </ul>
                  <h4>Telas Vinculadas</h4>
                  <ul>
                    {groupDetails.telas.map(tela => (
                      <li key={tela.id}>{tela.nome}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>Carregando detalhes do grupo...</p>
              )}
            </div>
          )}
          footerContent={(
            <div className="modal-footer">
              <Button variant="secondary" onClick={handleCloseGroupDetailsModal}>Fechar</Button>
            </div>
          )}
        />
      </div>
    </Layout>
  );
};

export default AccessManagement;
