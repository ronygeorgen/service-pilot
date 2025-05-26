import { createSlice } from "@reduxjs/toolkit";
import defaultSettings from "../../data/defaultSettings";

const initialState = {
    selectedService: null,
    showPricing: false,
    settings: defaultSettings,
    isEdited:false
}

const adminSlice = createSlice({
    name:'admin',
    initialState: initialState,
    reducers:{
        setIsEdited:(state, action)=>{
            state.isEdited = action.payload;
        },
        setSelectedService: (state, action)=>{
            state.selectedService = action.payload;
        },
        addService: (state)=>{
            const newService = {
                id: `service-${Date.now()}`,
                name: 'New Service',
                questions: [],
                };
            state.settings = ({
                ...state.settings.services, services:[...state.settings.services, newService]
            })
            state.selectedService=newService
        },
        updateService:(state, action)=>{
            state.selectedService = {...state.selectedService, ...action.payload};
            state.isEdited = true;
        },
        deleteService:(state, action)=>{
            state.settings = ({
                ...state.settings,
                services: state.settings.services.filter(s=>s.id !== action.payload.serviceId)
            });
            if (state.selectedService?.id == action.payload.serviceId){
                state.selectedService = null
            }
        },
        addQuestion: (state)=>{
            const newQuestion = {
                id: `question-${Date.now()}`,
                text: 'New Question',
                type: 'number',
                unitPrice: 0,
            };
            state.selectedService = ({
                ...state.selectedService,
                questions:[...(state.selectedService.questions||[]), newQuestion]
            })
            state.isEdited=true;
        },
        updateQuestion: (state, action)=>{
            state.selectedService = ({
                ...state.selectedService,
                questions:state.selectedService.questions.map(question=>{
                if (question.id == action.payload.questionId){
                    return {...question, ...action.payload.updates}
                }
                return question            
                })
            })
            state.isEdited=true;
        },
        deleteQuestion:(state, action)=>{
            state.selectedService = ({
                ...state.selectedService,
                questions: state.selectedService.questions.filter(q=>q.id!==action.payload.questionId)
            });
        },
        addPricing: (state, action)=>{
            const newOption = {
                id: `option-${Date.now()}`,
                name: 'New Option',
                discount: 0,
            };
            state.selectedService = {...state.selectedService, pricingOptions: [...(state.selectedService.pricingOptions || []), newOption]}
            state.isEdited=true;
        },
        updatePricing:(state, action)=>{
            console.log(action.payload);
            
            state.selectedService = {...state.selectedService, 
            pricingOptions:state.selectedService.pricingOptions.map(o=>o.id === action.payload.optionId ? { ...o, ...action.payload.updates} : o)}
            state.isEdited=true;
        },
        deletePricing:(state,action)=>{
            state.selectedService = ({
                ...state.selectedService,
                pricingOptions: state.selectedService.pricingOptions.filter(q=>q.id!==action.payload.optionId)
            });
        }
    },
})

export const {setIsEdited, setSelectedService, addService, updateService, deleteService, addQuestion, updateQuestion, deleteQuestion, addPricing, updatePricing, deletePricing} = adminSlice.actions;
export default  adminSlice.reducer;