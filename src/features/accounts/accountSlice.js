import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: '',
  isLoading: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    deposit: (state, action) => {
      state.balance += action.payload;
      state.isLoading = false;
    },
    convertingCurrency: state => {
      state.isLoading = true;
    },
    withdraw: (state, action) => {
      state.balance -= action.payload;
    },
    requestLoan: {
      prepare(amount, purpose) {
        return { payload: { amount, loanPurpose: purpose } };
      },
      reducer(state, action) {
        if (state.loan > 0) {
          return; // No new loan if there's already one active
        }

        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.loanPurpose;
        state.balance += action.payload.amount;
      },
    },
    payLoan: state => {
      state.balance -= state.loan;
      state.loan = 0;
      state.loanPurpose = '';
    },
  },
});

export function deposit(amount, currency) {
  if (currency === 'USD') return { type: 'account/deposit', payload: amount };

  return async function (dispatch, getState) {
    // API Call
    dispatch({ type: 'account/convertingCurrency' });
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
    );

    const data = await res.json();
    const converted = data.rates.USD;

    // return action
    dispatch({ type: 'account/deposit', payload: converted });
  };
}

export default accountSlice.reducer;
export const { convertingCurrency, withdraw, requestLoan, payLoan } =
  accountSlice.actions;

//# Redux classic way
// const initialState = {
//   balance: 0,
//   loan: 0,
//   loanPurpose: '',
//   isLoading: false,
// };
// const initialState = {
//   balance: 0,
//   loan: 0,
//   loanPurpose: '',
//   isLoading: false,
// };

// export default function reducer(state = initialState, action) {
//   switch (action.type) {
//     case 'account/deposit':
//       return {
//         ...state,
//         balance: state.balance + action.payload,
//         isLoading: false,
//       };
//     case 'account/convertingCurrency':
//       return { ...state, isLoading: true };
//     case 'account/withdraw':
//       return { ...state, balance: state.balance - action.payload };
//     case 'account/requestLoan':
//       if (state.loan > 0) {
//         return state; // No new loan if there's already one active
//       }
//       return {
//         ...state,
//         loan: action.payload.amount,
//         loanPurpose: action.payload.loanPurpose,
//         balance: state.balance + action.payload.amount,
//       };
//     case 'account/payLoan':
//       const currentLoanBalance = state.loan;
//       return { ...state, balance: state.balance - currentLoanBalance, loan: 0 };
//     default:
//       return state;
//   }
// }

// export function deposit(amount, currency) {
//   if (currency === 'USD') return { type: 'account/deposit', payload: amount };

//   return async function (dispatch, getState) {
//     // API Call
//     dispatch({ type: 'account/convertingCurrency' });
//     const res = await fetch(
//       `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=USD`
//     );

//     const data = await res.json();
//     const converted = data.rates.USD;

//     // return action
//     dispatch({ type: 'account/deposit', payload: converted });
//   };
// }
// export function withdraw(amount) {
//   return { type: 'account/withdraw', payload: amount };
// }
// export function requestLoan(amount, loanPurpose) {
//   return { type: 'account/requestLoan', payload: { amount, loanPurpose } };
// }
// export function payLoan() {
//   return { type: 'account/payLoan' };
// }
