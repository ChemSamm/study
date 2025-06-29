// 전역 변수
let todos = [];
let currentDate = new Date();
let currentWeekStart = getWeekStart(new Date());
let editingTodoId = null;

// 필터 설정
let hidePastTasks = true;
let showCompleted = false;
let monthFilter = 'all';
let customMonth = '';

// DOM 요소들
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const todoList = document.getElementById('todoList');
const calendarDays = document.getElementById('calendarDays');
const weeklyDays = document.getElementById('weeklyDays');
const currentMonthElement = document.getElementById('currentMonth');
const currentWeekElement = document.getElementById('currentWeek');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editInput = document.getElementById('editInput');
const editStartDate = document.getElementById('editStartDate');
const editEndDate = document.getElementById('editEndDate');
const closeModal = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');

// 필터 관련 DOM 요소들
const hidePastTasksCheckbox = document.getElementById('hidePastTasks');
const showCompletedCheckbox = document.getElementById('showCompleted');
const monthFilterSelect = document.getElementById('monthFilter');
const customMonthInput = document.getElementById('customMonth');

// 뷰 전환 버튼들
const viewToggleBtns = document.querySelectorAll('.toggle-btn');
const listView = document.getElementById('listView');
const weeklyView = document.getElementById('weeklyView');
const calendarView = document.getElementById('calendarView');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    setDefaultDates();
    setupEventListeners();
    renderAll();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 할 일 추가 폼
    todoForm.addEventListener('submit', addTodo);
    
    // 뷰 전환
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // 달력 네비게이션
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    // 주간 네비게이션
    prevWeekBtn.addEventListener('click', () => changeWeek(-1));
    nextWeekBtn.addEventListener('click', () => changeWeek(1));
    
    // 모달 관련
    closeModal.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', saveEdit);
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // 종료일 자동 설정
    startDate.addEventListener('change', function() {
        if (!endDate.value || new Date(startDate.value) > new Date(endDate.value)) {
            endDate.value = startDate.value;
        }
    });
    
    // 필터 이벤트 리스너
    hidePastTasksCheckbox.addEventListener('change', function() {
        hidePastTasks = this.checked;
        renderAll();
    });
    
    showCompletedCheckbox.addEventListener('change', function() {
        showCompleted = this.checked;
        renderAll();
    });
    
    monthFilterSelect.addEventListener('change', function() {
        monthFilter = this.value;
        if (monthFilter === 'custom') {
            customMonthInput.style.display = 'inline-block';
        } else {
            customMonthInput.style.display = 'none';
            renderAll();
        }
    });
    
    customMonthInput.addEventListener('change', function() {
        customMonth = this.value;
        renderAll();
    });
}

// 주의 시작일 계산 (일요일)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

// 기본 날짜 설정 (오늘 날짜)
function setDefaultDates() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    startDate.value = dateString;
    endDate.value = dateString;
}

// 로컬 스토리지에서 할 일 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// 로컬 스토리지에 할 일 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 할 일 추가
function addTodo(e) {
    e.preventDefault();
    
    const text = todoInput.value.trim();
    const start = startDate.value;
    const end = endDate.value;
    
    if (!text || !start || !end) return;
    
    if (new Date(start) > new Date(end)) {
        alert('시작일은 종료일보다 늦을 수 없습니다.');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        text: text,
        startDate: start,
        endDate: end,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    
    todoInput.value = '';
    setDefaultDates();
    
    renderAll();
}

// 할 일 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderAll();
}

// 할 일 완료 상태 토글
function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderAll();
    }
}

// 할 일 수정 모달 열기
function openEditModal(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        editingTodoId = id;
        editInput.value = todo.text;
        editStartDate.value = todo.startDate;
        editEndDate.value = todo.endDate;
        editModal.style.display = 'block';
    }
}

// 할 일 수정 모달 닫기
function closeEditModal() {
    editModal.style.display = 'none';
    editingTodoId = null;
    editInput.value = '';
    editStartDate.value = '';
    editEndDate.value = '';
}

// 할 일 수정 저장
function saveEdit(e) {
    e.preventDefault();
    
    if (editingTodoId === null) return;
    
    const text = editInput.value.trim();
    const start = editStartDate.value;
    const end = editEndDate.value;
    
    if (!text || !start || !end) return;
    
    if (new Date(start) > new Date(end)) {
        alert('시작일은 종료일보다 늦을 수 없습니다.');
        return;
    }
    
    const todo = todos.find(todo => todo.id === editingTodoId);
    if (todo) {
        todo.text = text;
        todo.startDate = start;
        todo.endDate = end;
        saveTodos();
        renderAll();
    }
    
    closeEditModal();
}

// 뷰 전환
function switchView(view) {
    viewToggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    listView.classList.remove('active');
    weeklyView.classList.remove('active');
    calendarView.classList.remove('active');
    
    if (view === 'list') {
        listView.classList.add('active');
    } else if (view === 'weekly') {
        weeklyView.classList.add('active');
    } else if (view === 'calendar') {
        calendarView.classList.add('active');
    }
}

// 달력 월 변경
function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

// 주간 변경
function changeWeek(delta) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (delta * 7));
    renderWeekly();
}

// 모든 뷰 렌더링
function renderAll() {
    renderTodoList();
    renderWeekly();
    renderCalendar();
}

// 필터링된 할 일 목록 가져오기
function getFilteredTodos() {
    let filteredTodos = [...todos];
    
    // 완료된 할 일 필터링
    if (!showCompleted) {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    }
    
    // 지나간 할 일 필터링
    if (hidePastTasks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredTodos = filteredTodos.filter(todo => {
            const endDate = new Date(todo.endDate);
            return endDate >= today;
        });
    }
    
    // 월별 필터링
    if (monthFilter !== 'all') {
        let targetMonth;
        const today = new Date();
        
        if (monthFilter === 'current') {
            targetMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (monthFilter === 'next') {
            targetMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        } else if (monthFilter === 'custom' && customMonth) {
            const [year, month] = customMonth.split('-');
            targetMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        }
        
        if (targetMonth) {
            const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
            filteredTodos = filteredTodos.filter(todo => {
                const todoStart = new Date(todo.startDate);
                const todoEnd = new Date(todo.endDate);
                return todoStart <= nextMonth && todoEnd >= targetMonth;
            });
        }
    }
    
    return filteredTodos;
}

// 리스트 뷰 렌더링
function renderTodoList() {
    todoList.innerHTML = '';
    
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="todo-item" style="text-align: center; color: #718096;">표시할 할 일이 없습니다.</div>';
        return;
    }
    
    // 시작일순으로 정렬
    const sortedTodos = filteredTodos.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    sortedTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        const isPast = new Date(todo.endDate) < new Date();
        const classes = ['todo-item'];
        
        if (todo.completed) classes.push('completed');
        if (isPast && !hidePastTasks) classes.push('past-task');
        
        todoItem.className = classes.join(' ');
        
        const startDate = new Date(todo.startDate);
        const endDate = new Date(todo.endDate);
        const startFormatted = `${startDate.getFullYear()}년 ${startDate.getMonth() + 1}월 ${startDate.getDate()}일`;
        const endFormatted = `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
        
        const dateText = startDate.getTime() === endDate.getTime() 
            ? startFormatted 
            : `${startFormatted} ~ ${endFormatted}`;
        
        todoItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <div class="todo-text">${todo.text}</div>
                <div class="todo-date">${dateText}</div>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="openEditModal(${todo.id})">수정</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
            </div>
        `;
        
        // 체크박스 이벤트
        const checkbox = todoItem.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        todoList.appendChild(todoItem);
    });
}

// 주간 뷰 렌더링
function renderWeekly() {
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 주차 표시
    const month = weekStart.getMonth() + 1;
    const year = weekStart.getFullYear();
    const weekNumber = Math.ceil((weekStart.getDate() + new Date(year, month - 1, 1).getDay()) / 7);
    currentWeekElement.textContent = `${year}년 ${month}월 ${weekNumber}주차`;
    
    weeklyDays.innerHTML = '';
    
    // 7일 생성
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'weekly-day';
        
        const dayNumber = currentDate.getDate();
        const isToday = isTodayDate(currentDate);
        
        if (isToday) {
            dayElement.classList.add('today-week');
        }
        
        // 해당 날짜의 할 일들 가져오기 (필터링 적용)
        const dayTodos = getTodosForDateRangeFiltered(currentDate);
        
        dayElement.innerHTML = `
            <div class="weekly-day-number">${dayNumber}</div>
            <div class="weekly-day-todos">
                ${dayTodos.map(todo => `
                    <div class="weekly-todo-preview" title="${todo.text}" onclick="openEditModal(${todo.id})">
                        ${todo.text.length > 15 ? todo.text.substring(0, 15) + '...' : todo.text}
                    </div>
                `).join('')}
            </div>
        `;
        
        // 날짜 클릭 시 해당 날짜로 할 일 추가 폼 설정
        dayElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('weekly-todo-preview')) {
                const dateString = formatDateForInput(currentDate);
                startDate.value = dateString;
                endDate.value = dateString;
                switchView('list');
            }
        });
        
        weeklyDays.appendChild(dayElement);
    }
}

// 달력 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 현재 월 표시
    currentMonthElement.textContent = `${year}년 ${month + 1}월`;
    
    // 달력 날짜 계산
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    calendarDays.innerHTML = '';
    
    // 6주치 달력 생성 (42일)
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dayNumber = currentDate.getDate();
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = isTodayDate(currentDate);
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // 해당 날짜의 할 일들 가져오기 (필터링 적용)
        const dayTodos = getTodosForDateRangeFiltered(currentDate);
        
        dayElement.innerHTML = `
            <div class="day-number">${dayNumber}</div>
            <div class="day-todos">
                ${dayTodos.map(todo => `
                    <div class="todo-preview" title="${todo.text}">
                        ${todo.text.length > 10 ? todo.text.substring(0, 10) + '...' : todo.text}
                    </div>
                `).join('')}
            </div>
        `;
        
        // 날짜 클릭 시 해당 날짜로 할 일 추가 폼 설정
        dayElement.addEventListener('click', () => {
            const dateString = formatDateForInput(currentDate);
            startDate.value = dateString;
            endDate.value = dateString;
            switchView('list');
        });
        
        calendarDays.appendChild(dayElement);
    }
}

// 특정 날짜 범위의 할 일들 가져오기 (필터링 적용)
function getTodosForDateRangeFiltered(date) {
    const filteredTodos = getFilteredTodos();
    const dateString = formatDateForInput(date);
    
    return filteredTodos.filter(todo => {
        const start = new Date(todo.startDate);
        const end = new Date(todo.endDate);
        const checkDate = new Date(dateString);
        return checkDate >= start && checkDate <= end;
    });
}

// 특정 날짜 범위의 할 일들 가져오기 (시작일~종료일 포함)
function getTodosForDateRange(date) {
    const dateString = formatDateForInput(date);
    return todos.filter(todo => {
        const start = new Date(todo.startDate);
        const end = new Date(todo.endDate);
        const checkDate = new Date(dateString);
        return checkDate >= start && checkDate <= end;
    });
}

// 오늘 날짜인지 확인
function isTodayDate(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// 날짜를 input 형식으로 포맷팅
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
} 