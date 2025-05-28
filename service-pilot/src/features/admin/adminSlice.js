import { createSlice } from "@reduxjs/toolkit";
import defaultSettings from "../../data/defaultSettings";
import { adminLoginAction, createService, deleteServiceAction, editServiceAction, serviceListAction } from "./adminActions";

const initialState = {
    success:false,
    error:'',
    isLoginned:null,
    selectedService: null,
    showPricing: false,
    settings: {services:null},
    isEdited:false
}

const adminSlice = createSlice({
    name:'admin',
    initialState: initialState,
    reducers:{
        setMinimumPrice:(state,action)=>{
            state.settings = {...state.settings, minimumPrice:action.payload};
        },
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
                isNew: true,
                questions: [],
                };
            state.settings = ({
                ...state.settings, services:[...state.settings.services || [], newService]
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
                type: 'choice',
                unit_price: 0,
            };
            state.selectedService = ({
                ...state.selectedService,
                questions:[...(state.selectedService.questions||[]), newQuestion]
            })
            state.isEdited=true;
        },
        updateQuestion: (state, action)=>{
            const type = action.payload?.updates.type
            console.log('type', type, action.payload)
            
            state.selectedService = ({
                ...state.selectedService,
                questions:state.selectedService.questions.map(question=>{
                if (question.id == action.payload.questionId){
                    let updatedQuestion = { ...question, ...action.payload.updates };   
                    if (type && type !== question.type){
                        if(type=='choice'){
                            delete updatedQuestion.unit_price;
                            // delete updatedQuestion.options;
                        }else{
                            delete updatedQuestion.options;
                            delete updatedQuestion.optionPrices;
                        }
                        updatedQuestion.type = type;
                    }
                    return updatedQuestion
                }
                return question            
                })
            })
            state.isEdited=true;
        },
        updateQuestionOptionPrice: (state, action) => {
            state.selectedService = {
                ...state.selectedService,
                questions: state.selectedService.questions.map(question => {
                if (question.id === action.payload.questionId) {
                    // Return a new question object with updated optionPrices
                    return {
                    ...question,
                    optionPrices: {
                        ...question.optionPrices,
                        ...action.payload.value,
                    },
                    };
                }
                return question; // Return unchanged question
                }),
            };
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
        },
        addFeature:(state, action)=>{
            const newFeature = action.payload;
            state.selectedService = ({
                ...state.selectedService,
                features: [...(state.selectedService.features || []), newFeature]
            })
            state.selectedService.pricingOptions = state.selectedService.pricingOptions.map(opt => ({
                ...opt,
                selectedFeatures: [
                ...(opt.selectedFeatures || []),
                { id: newFeature.id, is_included: false }
                ]
            }));
        },
        removeFeature:(state, action)=>{
            const featureId = action.payload;
            state.selectedService = ({
                ...state.selectedService,
                features: state.selectedService.features.filter(f => f.id !== featureId),
                pricingOptions: state.selectedService.pricingOptions.map(option => ({
                    ...option,
                    selectedFeatures: option.selectedFeatures?.filter(id => id !== featureId)
                }))
            })
        },
        toggleFeature:(state, action)=>{
            const {optionId, featureId} = action.payload;
            console.log(optionId, 'feat', action.payload);
            
            state.selectedService = {
                ...state.selectedService,
                pricingOptions: state.selectedService.pricingOptions.map(opt => {
                if (opt.id !== optionId) return opt;
                    const existing = opt.selectedFeatures?.find(f => f.id === featureId);

                    return {
                    ...opt,
                    selectedFeatures: existing
                        ? opt.selectedFeatures.map(f =>
                            f.id === featureId ? { ...f, is_included: !f.is_included } : f
                        )
                        : [...(opt.selectedFeatures || []), { id: featureId, is_included: true }]
                    };
                })
            }
        }
    },
    extraReducers(builder){
        builder
        .addCase(createService.fulfilled, (state, action)=>{
            const createdService = action.payload[0];
            const tempId = action.meta.arg.id;
            state.settings.services = state.settings.services.map(service =>
                service.id === tempId ? { ...createdService } : service
            );
            state.selectedService=null
        })
        .addCase(serviceListAction.fulfilled, (state, action)=>{
            state.settings = {...state.settings, services:action.payload};
        })
        .addCase(editServiceAction.fulfilled, (state, action)=>{
            const id = action.meta.arg.id
            state.settings = {...state.settings, services:state.settings?.services?.map(s=>s.id==id?action.payload:s)};
            state.selectedService = null;
            state.isEdited = false;
        })
        .addCase(deleteServiceAction.fulfilled, (state, action)=>{
            const id = action.meta.arg.id
            state.settings.services = state.settings?.services?.filter(s => s?.id !== id) || [];
            state.selectedService = null;
        })
        .addCase(adminLoginAction.fulfilled, (state, action)=>{
            localStorage.setItem('access_token',action.payload?.access_token)
            localStorage.setItem('refresh_token',action.payload?.refresh_token)
            state.isLoginned = true;
        })
        .addCase(adminLoginAction.rejected, (state, action)=>{
            console.log(action.payload, 'fff');   
            state.error = action.payload
        })
        
    }
})

export const {setMinimumPrice, setIsEdited, setSelectedService, addService, updateService, deleteService, addQuestion, updateQuestion, updateQuestionOptionPrice, deleteQuestion, addPricing, updatePricing, deletePricing,
    addFeature, removeFeature, toggleFeature
} = adminSlice.actions;
export default  adminSlice.reducer;