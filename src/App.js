import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
	var [users, setUsers] = useState([]);
	var [filteredUsers, setFilteredUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCheckboxes, setSelectedCheckboxes] = useState(0);
	const rowsPerPage = 10;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
				const userData = await response.json();
				setUsers(userData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		}

		fetchData();
	}, []);

	function displayUsers(userList, page) {
		userList = searchQuery ? filteredUsers : users;
		return (
			<tbody>
				{userList.slice((page - 1) * rowsPerPage, page * rowsPerPage).map(user => (
					<tr key={user.id} id={user.id}>
						<td>
							<input type="checkbox" className="select-row" onChange={handleSelectCheckbox} />
						</td>
						<td>{user.name}</td>
						<td>{user.email}</td>
						<td>{user.role}</td>
						<td>
							<button class="fa fa-pencil-square-o" onClick={(e) => editUser(user.id, e.target)}> </button>
							<button class="delete trash" onClick={() => deleteUser(user.id, this)} style={{ border: 'none' }}><i class="fa fa-trash"></i>
							</button>
						</td>
					</tr>
				))}
			</tbody>
		);
	}

	function editUser(userId, btn) {
		const row = document.getElementById(userId);
		const cells = row.getElementsByTagName('td');
		if (btn.textContent === ' ') {
			cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}" class="edit-name">`;
			cells[2].innerHTML = `<input type="email" value="${cells[2].textContent}" class="edit-email">`;
			cells[3].innerHTML = `<input type="text" value="${cells[3].textContent}" class="edit-role">`;
			btn.textContent = 'Save';
			btn.classList.remove('fa')
			btn.classList.remove('fa-pencil-square-o')
		}
		else {
			const newName = row.querySelector('.edit-name').value;
			const newEmail = row.querySelector('.edit-email').value;
			const newRole = row.querySelector('.edit-role').value;

			cells[1].innerHTML = `<td>${newName}</td>`;
			cells[2].innerHTML = `<td>${newEmail}</td>`;
			cells[3].innerHTML = `<td>${newRole}</td>`;
			btn.textContent = ' ';
			btn.classList.add('fa')
			btn.classList.add('fa-pencil-square-o')

			const userIndex = users.findIndex(user => user.id === userId);
			users[userIndex].name = newName;
			users[userIndex].email = newEmail;
			users[userIndex].role = newRole;

			setUsers(users);
			displayUsers(users, currentPage);
		}
	};

	function deleteUser(userId, btn) {
		users = users.filter(user => user.id !== userId);
		setUsers(users);
		displayUsers(users, currentPage);
	};

	const userTableBody = document.querySelector('#user-table tbody');
	function deleteSelectedButton() {
		const selectedCheckboxes = userTableBody.querySelectorAll('.select-row:checked');
		selectedCheckboxes.forEach(checkbox => {
			const row = checkbox.closest('tr');
			const userId = row.id;
			users = users.filter(user => user.id !== userId);
		});
		setUsers(users);
		displayUsers(users, currentPage);
	}

	function selectAllCheckbox() {
		const checkboxes = userTableBody.querySelectorAll('.select-row');
		checkboxes.forEach(checkbox => {
			if (checkbox.checked === true) {
				checkbox.checked = false;
				setSelectedCheckboxes(prevCount => prevCount - 1);
			}
			else {
				checkbox.checked = true;
				setSelectedCheckboxes(prevCount => prevCount + 1);
			}
		});
	};
	function searchBox() {
		const searchBox = document.getElementById('search-box')
		const searchQuery = searchBox.value.toLowerCase();
		setSearchQuery(searchQuery);
		const filteredUsers = users.filter(user => {
			return (
				user.name.toLowerCase().includes(searchQuery) ||
				user.email.toLowerCase().includes(searchQuery) ||
				user.role.toLowerCase().includes(searchQuery)
			);
		});
		setFilteredUsers(filteredUsers);
		displayUsers(filteredUsers, 1);
	};


	function updatePaginationLeft(totalUsers, selectedCheckboxes) {
		const paginationButtons = [];
		const paginationLeftText = `${selectedCheckboxes} of ${totalUsers} row(s) selected`;
		paginationButtons.push(
			<p key="selectedRowCount">{paginationLeftText}</p>
		);

		return paginationButtons;
	}

	function handleSelectCheckbox(event) {
		const isChecked = event.target.checked;

		if (isChecked) {
			setSelectedCheckboxes(prevCount => prevCount + 1);
		} else {
			setSelectedCheckboxes(prevCount => prevCount - 1);
		}
	}

	function updatePaginationRight(totalUsers, currentPage) {
		const pageCount = Math.ceil(totalUsers / rowsPerPage);
		const paginationButtons = [];

		paginationButtons.push(
			<button key="first" onClick={() => handlePageChange(1)}> &lt; &lt; </button>
		);

		paginationButtons.push(
			<button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
		);

		for (let i = 1; i <= pageCount; i++) {
			paginationButtons.push(
				<button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>{i}</button>
			);
		}

		paginationButtons.push(
			<button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pageCount}>&gt;</button>
		);

		paginationButtons.push(
			<button key="last" onClick={() => handlePageChange(pageCount)}>&gt; &gt;</button>
		);

		return paginationButtons;
	}

	function handlePageChange(pageNumber) {
		setCurrentPage(pageNumber);
	}


	return (
		<>

			<header>
				<h1 style={{fontFamily:"Montserrat"}}>HireQuotient Admin Dashboard</h1>
			</header>
			<div className="top" style={{ display: 'flex', justifyContent: 'space-between' }}>
				<input type="text" id="search-box" placeholder="Search..." className="search-box" onInput={searchBox} />
				<div className="trash" onClick={deleteSelectedButton}>
					<i className="fa fa-trash delete-selected" id="delete-selected"></i>
				</div>
			</div>

			<table id="user-table">
				<thead>
					<tr>
						<th><input type="checkbox" id="select-all" onClick={selectAllCheckbox} />Select All</th>
						<th>Name</th>
						<th>Email</th>
						<th>Role</th>
						<th>Actions</th>
					</tr>
				</thead>

				{displayUsers(users, currentPage)}
			</table>

			<div class="bottom" style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div id="pagination-left">
					{updatePaginationLeft(searchQuery ? filteredUsers.length : users.length, selectedCheckboxes)}
				</div>

				<div id="pagination">
					{updatePaginationRight(searchQuery ? filteredUsers.length : users.length, currentPage)}
				</div>
			</div>
		</>
	);
}

export default App;
