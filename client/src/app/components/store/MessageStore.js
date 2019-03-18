import {createStore} from 'redux'

function reducer(state = {}, action) {
    return action;
}
const store = createStore(reducer);
export default store;