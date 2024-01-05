// AdminPanel.jsx
import React, { Component } from "react"
import { Input, Button } from "@material-ui/core"
import { Link } from "react-router-dom"
import { message } from "antd" // superbe bibliothèque..
import logo from "../../assets/hdmlogo.png"

import axios from "axios"

class AdminPanel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userEmail: "",
      role: "ADMIN",
      showCreateUserForm: false,
      showRoleUpdateForm: false,
      newUserEmail: "",
      newUserRole: "USER",
      users: [],
      showUserTable: false,
    }
  }
  componentDidMount() {
    this.fetchUsers()
  }

  fetchUsers = () => {
    axios
      .get(`http://localhost:4001/users`)
      .then((response) => {
        this.setState({ users: response.data })
      })
      .catch((error) => {
        message.error("Erreur lors de la récupération des utilisateurs")
      })
  }

  toggleRoleUpdateForm = () => {
    this.setState((prevState) => ({
      showRoleUpdateForm: !prevState.showRoleUpdateForm,
    }))
  }

  toggleCreateUserForm = () => {
    this.setState((prevState) => ({
      showCreateUserForm: !prevState.showCreateUserForm,
    }))
  }

  toggleUserTable = () => {
    this.setState((prevState) => ({
      showUserTable: !prevState.showUserTable,
    }))
  }

  handleNewUserEmailChange = (e) => {
    this.setState({ newUserEmail: e.target.value })
  }

  handleNewUserRoleChange = (e) => {
    this.setState({ newUserRole: e.target.value })
  }

  handleEmailChange = (e) => {
    this.setState({ userEmail: e.target.value })
  }

  handleRoleChange = (e) => {
    this.setState({ role: e.target.value })
  }

  handleCreateUser = (e) => {
    e.preventDefault()
    const { newUserEmail, newUserRole } = this.state

    axios
      .post(`http://localhost:4001/insertUser`, {
        email: newUserEmail,
        role: newUserRole,
      })
      .then((response) => {
        message.success("Nouvel accès créé pour " + newUserEmail + " !")
        this.setState({ newUserEmail: "" })
        this.fetchUsers()
      })
      .catch((error) => {
        message.error(error.response.data.error)
      })
  }

  handleUpdateRole = (e) => {
    e.preventDefault()
    const { userEmail, role } = this.state

    axios
      .put(`http://localhost:4001/updateRoles`, {
        email: userEmail,
        newRole: role,
      })
      .then((response) => {
        // message.success(JSON.stringify(response.data.message)) (il maffiche msg entre guillemets laisse beton on verra apres..)
        message.success("Rôle mis à jour !")
        this.fetchUsers()
      })
      .catch((error) => {
        message.error(error.response.data.error)
      })
  }

  handleDeleteUser = (email) => {
    axios
      .delete(`http://localhost:4001/deleteUser/${email}`)
      .then(() => {
        message.success("Utilisateur supprimé avec succès")
        this.fetchUsers() 
      })
      .catch((error) => {
        message.error("Erreur lors de la suppression de l'utilisateur")
      })
  }

  render() {
    const {
      showCreateUserForm,
      newUserEmail,
      newUserRole,
      showRoleUpdateForm,
      users,
      showUserTable,
    } = this.state

    return (
      <div>
        <Link to="/">
          <img
            className="logo"
            src={logo}
            alt=""
            style={{
              width: "150px",
              position: "absolute",
              top: "0",
              left: "0",
            }}
          />
        </Link>
        <div className="content">
          <h1 style={{ fontFamily: "Nunito / Nunito Sans" }}>
            <i>Administration</i>
          </h1>
          <br />
          <Button onClick={this.toggleCreateUserForm} variant="contained">
            {showCreateUserForm
              ? "Cacher le formulaire"
              : "Créer un nouvel accès"}
          </Button>
          <br />
          {showCreateUserForm && (
            <form onSubmit={this.handleCreateUser}>
              <div>
                <label>
                  <b>Email du nouvel utilisateur: </b>
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={this.handleNewUserEmailChange}
                  required
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    margin: "10px",
                  }}
                />
              </div>
              <div>
                <label>
                  <b>Rôle du nouvel utilisateur:</b>
                </label>
                <select
                  value={newUserRole}
                  onChange={this.handleNewUserRoleChange}
                  style={{ borderRadius: "8px", margin: "10px" }}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
              <Button type="submit" variant="contained" color="primary">
                Créer l'utilisateur
              </Button>
            </form>
          )}

          <br />
          <Button onClick={this.toggleRoleUpdateForm} variant="contained">
            {showRoleUpdateForm
              ? "Cacher le formulaire de rôle"
              : "Modifier un rôle"}
          </Button>

          {showRoleUpdateForm && (
            <form onSubmit={this.handleUpdateRole}>
              <div>
                <label>
                  <b>Email de l'utilisateur : </b>
                </label>

                <input
                  type="email"
                  value={this.state.userEmail}
                  onChange={this.handleEmailChange}
                  required
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    margin: "10px",
                  }}
                />
              </div>
              <div>
                <label>
                  <b>Choisissez le rôle :</b>
                </label>
                <select
                  value={this.state.role}
                  onChange={this.handleRoleChange}
                  style={{ borderRadius: "8px", margin: "10px" }}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
              <br />
              <Button variant="contained" color="primary" type="submit">
                Modifier le rôle
              </Button>
            </form>
          )}
        </div>

<br />
        <Button onClick={this.toggleUserTable} variant="contained">
          {showUserTable
            ? "Cacher le tableau"
            : "Afficher le tableau des accès"}
        </Button>

        {showUserTable && (
        <table className="user-table">
        <thead>
              <tr>
                <th>Email</th>
                <th>Rôle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                  <button className="delete-button" onClick={() => this.handleDeleteUser(user.email)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }
}

export default AdminPanel