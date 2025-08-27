<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import HeaderComponent from '../components/HeaderComponent.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const event = ref(null);
const isLoading = ref(true);

const totalBudget = ref(0);
const expenses = ref([]);
const newExpense = ref({
    name: '',
    amount: 0,
    category: '',
    isPaid: false,
});
const expenseCategories = ref([
    'Catering', 'Lugar', 'Decoración', 'Música', 'Vestimenta', 'Flores',
    'Invitaciones', 'Fotografía', 'Transporte', 'Regalos', 'Otros'
]);

const editingExpense = ref(null);

const currentSpent = computed(() => {
    return expenses.value.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
});

const balance = computed(() => {
    return parseFloat(totalBudget.value) - currentSpent.value;
});

const budgetProgress = computed(() => {
    if (totalBudget.value > 0) {
        return Math.min((currentSpent.value / parseFloat(totalBudget.value)) * 100, 100);
    }
    return 0;
});

const fetchEventData = async () => {
    try {
        const eventId = route.params.id;
        const response = await axios.get(`http://localhost:3000/api/eventos/${eventId}`);
        event.value = response.data;
        totalBudget.value = event.value.budget || 0;
        expenses.value = event.value.expenses || [];
    } catch (error) {
        console.error('Error al cargar los datos del evento y presupuesto:', error);
    } finally {
        isLoading.value = false;
    }
};

const saveBudget = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No hay token de autenticación.');
        return;
    }

    try {
        const eventId = route.params.id;
        await axios.put(`http://localhost:3000/api/eventos/${eventId}/presupuesto`, {
            budget: totalBudget.value,
            expenses: expenses.value,
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Presupuesto y gastos guardados correctamente.');
    } catch (error) {
        console.error('Error al guardar el presupuesto y los gastos:', error);
    }
};

const addExpense = async () => {
    if (newExpense.value.name && newExpense.value.amount > 0) {
        expenses.value.push({ ...newExpense.value });
        clearExpenseForm();
        await saveBudget();
    }
};

const removeExpense = async (index) => {
    expenses.value.splice(index, 1);
    await saveBudget();
};

const togglePaidStatus = async (expense) => {
    expense.isPaid = !expense.isPaid;
    await saveBudget();
};

const clearExpenseForm = () => {
    newExpense.value = {
        name: '',
        amount: 0,
        category: '',
        isPaid: false,
    };
};

const startEdit = (expense) => {
    editingExpense.value = { ...expense, original: expense };
};

const saveEdit = async () => {
    const index = expenses.value.findIndex(exp => exp === editingExpense.value.original);
    if (index !== -1) {
        expenses.value[index] = { ...editingExpense.value };
        delete expenses.value[index].original;
        editingExpense.value = null;
        await saveBudget();
    }
};

const cancelEdit = () => {
    editingExpense.value = null;
};

onMounted(() => {
    fetchEventData();
});

watch(totalBudget, () => {
    saveBudget();
});
</script>

<template>
    <HeaderComponent />
    <div class="budget-main-container">
        <div v-if="isLoading" class="loading-state">
            <p>{{ t('budget.loadingBudget') }}</p>
        </div>
        
        <div v-else class="budget-content">
            <h1 class="page-title">{{ event.nombre }} - {{ t('budget.control') }}</h1>

            <router-link :to="`/eventos/${event._id}`" class="btn-primary">{{ t('general.goBack') }}</router-link>

            <section class="budget-summary">
                <div class="summary-card total">
                    <h2>{{ t('budget.total') }}</h2>
                    <input type="number" v-model="totalBudget" class="budget-input">
                </div>
                <div class="summary-card spent">
                    <h2>{{ t('budget.spent') }}</h2>
                    <p class="amount spent-amount">{{ currentSpent.toFixed(2) }}€</p>
                </div>
                <div class="summary-card balance">
                    <h2>{{ t('budget.balance') }}</h2>
                    <p class="amount balance-amount" :class="{'negative': balance < 0}">{{ balance.toFixed(2) }}€</p>
                    <p class="amount balance-amount balance-negative" :class="{'negative': balance < 0}" v-if="balance < 0">
                        {{ t('budget.overBudget') }}
                    </p>
                </div>
            </section>
            
            <div class="progress-bar-container">
                <div class="progress-bar" :style="{ width: budgetProgress + '%' }"></div>
            </div>

            <section class="expense-form-section">
                <h2>{{ t('budget.addNewExpense') }}</h2>
                <div class="expense-form-grid">
                    <div class="input-group">
                        <label for="expense-name">{{ t('budget.expenseName') }}</label>
                        <input id="expense-name" v-model="newExpense.name" type="text" :placeholder="t('budget.placeholderExpense')">
                    </div>
                    <div class="input-group">
                        <label for="expense-amount">{{ t('budget.cost') }} (€)</label>
                        <input id="expense-amount" v-model.number="newExpense.amount" type="number" step="0.01">
                    </div>
                    <div class="input-group">
                        <label for="expense-category">{{ t('budget.category') }}</label>
                        <select id="expense-category" v-model="newExpense.category">
                            <option value="" disabled>{{ t('budget.selectCategory') }}</option>
                            <option v-for="cat in expenseCategories" :key="cat" :value="cat">{{ t(`categories.${cat.toLowerCase()}`) }}</option>
                        </select>
                    </div>
                    <button @click="addExpense" class="btn-add-expense">
                        {{ t('budget.addExpenseBtn') }}
                    </button>
                </div>
            </section>

            <section class="expense-list-section">
                <h2>{{ t('budget.expenseList', { count: expenses.length }) }}</h2>
                <div v-if="expenses.length === 0" class="empty-state">
                    <p>{{ t('budget.noExpenses') }}</p>
                </div>
                <div v-else class="table-container">
                    <table class="expense-table">
                        <thead>
                            <tr>
                                <th>{{ t('budget.table.expense') }}</th>
                                <th>{{ t('budget.table.cost') }}</th>
                                <th>{{ t('budget.table.category') }}</th>
                                <th>{{ t('budget.table.status') }}</th>
                                <th>{{ t('budget.table.actions') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(expense, index) in expenses" :key="index">
                                <template v-if="editingExpense && editingExpense.original === expense">
                                    <td><input v-model="editingExpense.name" type="text"></td>
                                    <td><input v-model.number="editingExpense.amount" type="number" step="0.01"></td>
                                    <td>
                                        <select v-model="editingExpense.category">
                                            <option v-for="cat in expenseCategories" :key="cat" :value="cat">{{ t(`categories.${cat.toLowerCase()}`) }}</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span @click="togglePaidStatus(editingExpense)" class="paid-status" :class="{'is-paid': editingExpense.isPaid, 'is-pending': !editingExpense.isPaid}">
                                            {{ editingExpense.isPaid ? t('budget.table.paid') : t('budget.table.pending') }}
                                        </span>
                                    </td>
                                    <td>
                                        <button @click="saveEdit" class="btn-action btn-save">{{ t('general.save') }}</button>
                                        <button @click="cancelEdit" class="btn-action btn-cancel">{{ t('general.cancel') }}</button>
                                    </td>
                                </template>
                                <template v-else>
                                    <td>{{ expense.name }}</td>
                                    <td>{{ expense.amount.toFixed(2) }}€</td>
                                    <td>{{ t(`categories.${expense.category.toLowerCase()}`) }}</td>
                                    <td>
                                        <span @click="togglePaidStatus(expense)" class="paid-status" :class="{'is-paid': expense.isPaid, 'is-pending': !expense.isPaid}">
                                            {{ expense.isPaid ? t('budget.table.paid') : t('budget.table.pending') }}
                                        </span>
                                    </td>
                                    <td>
                                        <button @click="startEdit(expense)" class="btn-action btn-edit">{{ t('general.edit') }}</button>
                                        <button @click="removeExpense(index)" class="btn-action btn-delete">{{ t('general.delete') }}</button>
                                    </td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
:root {
    --primary-color: #3b82f6;
    --secondary-color: #22c55e;
    --text-color: #333;
    --background-color: #f1f5f9;
    --card-background: #fff;
    --shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.budget-main-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
    color: var(--text-color);
}

.budget-content {
    background-color: var(--card-background);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: var(--shadow);
}

.page-title {
    text-align: center;
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 2.5rem;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 1rem;
}

h2 {
    font-size: 1.8rem;
    color: #444;
    margin-bottom: 1.5rem;
}
.btn-primary {
    background-color: #3b82f6;
    color: #fff;
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-bottom: 1.5rem;
    text-decoration: none;
}

.btn-primary:hover {
    background-color: #2563eb;
}

/* --- SECCIÓN DE RESUMEN --- */
.budget-summary {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;
    margin-top: 2rem;
}

.summary-card {
    flex: 1;
    background-color: var(--background-color);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    text-align: center;
}

.summary-card h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    color: #666;
}

.amount {
    font-size: 2.5rem;
    font-weight: 700;
}

.spent-amount {
    color: #ef4444;
}

.balance-amount {
    color: var(--secondary-color);
}

.balance-amount.negative {
    color: #ef4444;
}
.balance-negative{
    font-size: 1.2rem;
    color: #ef4444;
}

.budget-input {
    font-size: 2.5rem;
    font-weight: 700;
    width: 100%;
    text-align: center;
    border: none;
    background: transparent;
    border-bottom: 2px dashed #94a3b8;
    color: var(--primary-color);
    outline: none;
    transition: border-color 0.3s;
}

.budget-input:focus {
    border-bottom: 2px solid var(--primary-color);
}

/* --- BARRA DE PROGRESO --- */
.progress-bar-container {
    width: 100%;
    height: 15px;
    background-color: #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 3rem;
}

.progress-bar {
    height: 100%;
    background-color: var(--secondary-color);
    background-image: linear-gradient(to right, #22c55e, #10b981);
    transition: width 0.5s ease-in-out;
    border-radius: 8px;
}

/* --- FORMULARIO DE GASTOS --- */
.expense-form-section {
    background-color: #f8fafc;
    padding: 2rem;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
    margin-bottom: 3rem;
}

.expense-form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr) 0.5fr;
    gap: 1.5rem;
    align-items: flex-end;
}

.input-group {
    display: flex;
    flex-direction: column;
}

.input-group label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #555;
}

.input-group input,
.input-group select {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
    background-color: #fff;
}

.input-group input:focus,
.input-group select:focus {
    outline: none;
    border-color: var(--primary-color);
}

.btn-add-expense {
    grid-column: 4;
    background-color: rgb(25, 25, 122);
    color: #ffffff;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: transform 0.2s, background-color 0.3s;
}

.btn-add-expense:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
}

/* --- LISTA DE GASTOS Y TABLA --- */
.table-container {
    overflow-x: auto;
}

.expense-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.5rem;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    overflow: hidden;
}

.expense-table th, .expense-table td {
    padding: 1.2rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.expense-table th {
    background-color: #f1f5f9;
    font-weight: 700;
    color: #4a5568;
    text-transform: uppercase;
    font-size: 0.9rem;
}

.expense-table tr:hover {
    background-color: #fafafa;
}

.paid-status {
    padding: 0.4rem 0.8rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.paid-status.is-paid {
    background-color: #dcfce7;
    color: #16a34a;
}

.paid-status.is-pending {
    background-color: #fee2e2;
    color: #dc2626;
}

.btn-action {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
}

.btn-edit {
    background-color: #fde68a;
    color: #92400e;
    margin-right: 0.5rem;
}

.btn-edit:hover {
    background-color: #fcd34d;
}

.btn-delete {
    background-color: #fecaca;
    color: #b91c1c;
}

.btn-delete:hover {
    background-color: #fca5a5;
}

.btn-save {
    background-color: #dcfce7;
    color: #16a34a;
    margin-right: 0.5rem;
}

.btn-save:hover {
    background-color: #bbf7d0;
}

.btn-cancel {
    background-color: #e2e8f0;
    color: #4a5568;
}

.btn-cancel:hover {
    background-color: #cbd5e1;
}

.loading-state, .empty-state {
    text-align: center;
    padding: 3rem 0;
    font-size: 1.2rem;
    color: #888;
}

@media (max-width: 768px) {
    .budget-summary {
        flex-direction: column;
    }
    .expense-form-grid {
        grid-template-columns: 1fr;
    }
    .btn-add-expense {
        grid-column: 1;
    }
}
</style>