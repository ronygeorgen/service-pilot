import { createSlice } from "@reduxjs/toolkit";
import { adminLoginAction, createService, deleteServiceAction, editServiceAction, getGlobalSettingsActions, globalSettingsAction, serviceListAction } from "./adminActions";

const admin_info = localStorage.getItem('admin_info')

const initialState = {
    admin_info:admin_info,
    success:false,
    error:'',
    pending:false,
    service_list_pending:false,
    isLoginned:null,
    selectedService: null,
    showPricing: false,
    settings: null,
    services: [],
    isEdited:false
}

const adminSlice = createSlice({
    name:'admin',
    initialState: initialState,
    reducers:{
        setReset:(state)=>{
            state.success=false;
            state.error=''
        },
        setMinimumPrice:(state,action)=>{
            state.settings = {...state.settings, minimum_price:action.payload};
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
                description: '',
                isNew: true,
                questions: [],
                };
            state.services = [newService, ...state.services || []]
            state.selectedService=newService
        },
        updateService:(state, action)=>{
            state.selectedService = {...state.selectedService, ...action.payload};
            state.isEdited = true;
        },
        deleteService:(state, action)=>{
            const idToDelete = action.payload;
            state.services = state.services.filter(service => service.id !== idToDelete);
        },
        addQuestion: (state)=>{
            const newQuestion = {
                id: `question-${Date.now()}`,
                text: 'New Question',
                type: 'choice',
                unit_price: 0,
                isNew: true,
            };
            state.selectedService = ({
                ...state.selectedService,
                questions:[newQuestion, ...(state.selectedService.questions||[])]
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
                    return {
                    ...question,
                    options: question.options.map(opt => {
                        const key = Object.keys(opt)[0];
                        if (key === Object.keys(action.payload.value)[0]) {
                        // Replace with new value
                        return action.payload.value;
                        }
                        return opt;
                    }),
                    };
                }
                return question;
                }),
            };
            state.isEdited=true;
        },

        deleteQuestion:(state, action)=>{
            state.selectedService = ({
                ...state.selectedService,
                questions: state.selectedService.questions.filter(q=>q.id!==action.payload.questionId)
            });
            state.isEdited=true;
        },
        addPricing: (state, action)=>{
            const newOption = {
                id: `option-${Date.now()}`,
                name: 'New Option',
                discount: 0,
                isNew: true
            };
            state.selectedService = {...state.selectedService, pricingOptions: [newOption,...(state.selectedService.pricingOptions || [])]}
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
            state.isEdited=true;
        },
        addFeature:(state, action)=>{
            const newFeature = action.payload;
            state.selectedService = ({
                ...state.selectedService,
                features: [...(state.selectedService.features || []), newFeature]
            })
            state.selectedService.pricingOptions = state.selectedService?.pricingOptions?.map(opt => ({
                ...opt,
                selectedFeatures: [
                ...(opt.selectedFeatures || []),
                { id: newFeature.id, is_included: false }
                ]
            }));
            state.isEdited=true;
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
            state.isEdited=true;
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
            state.isEdited=true;
        },
        adminLogout: (state) => {
            // Clear all admin-related state
            state.admin_info = null;
            state.isLoginned = false;
            state.success = false;
            state.error = '';
            state.pending = false;
            
            // Clear selected service if needed
            state.selectedService = null;
            
            // Clear localStorage items
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('admin_info');
            localStorage.removeItem('user_authenticated');
        },
    },
    extraReducers(builder){
        builder
        .addCase(createService.pending, (state, action)=>{
            state.pending =true;
        })
        .addCase(createService.fulfilled, (state, action)=>{
            const createdService = action.payload;
            const tempId = action.meta.arg.id;
            console.log(tempId, 'remm', 'ddd')
            state.services = state.services.map(service =>
                service.id === tempId ? { ...createdService } : service
            );
            state.pending = false;
            state.selectedService=null
            state.isEdited=false
        })
        .addCase(serviceListAction.pending, (state, action)=>{
            state.service_list_pending =true;
        })
        .addCase(serviceListAction.fulfilled, (state, action)=>{
            state.services = action.payload;
            state.service_list_pending =false;
        })
        .addCase(editServiceAction.pending, (state, action)=>{
            state.pending =true;
        })
        .addCase(editServiceAction.fulfilled, (state, action)=>{
            const id = action.meta.arg.id
            state.services = state.services?.map(s=>s.id==id?action.payload:s);
            state.selectedService = null;
            state.isEdited = false;
            state.pending = false;
        })
        .addCase(deleteServiceAction.pending, (state, action)=>{
            state.pending =true;
        })
        .addCase(deleteServiceAction.fulfilled, (state, action)=>{
            const id = action.meta.arg
            console.log(id, 'iddddd');
            
            state.services = state.services?.filter(s => s?.id !== id) || [];
            state.selectedService = null;
            state.success=true;
            state.pending=false;
        })
        .addCase(adminLoginAction.fulfilled, (state, action)=>{
            localStorage.setItem('access_token',action.payload?.access)
            localStorage.setItem('refresh_token',action.payload?.refresh)
            localStorage.setItem('admin_info', action.payload?.user_info)
            state.admin_info = action.payload?.user_info;
            state.isLoginned = true;
            state.success=true
            state.error = '';
        })
        .addCase(adminLoginAction.rejected, (state, action)=>{
            console.log(action.payload, 'fff');   
            state.error = action.payload?.error
        })
        .addCase(globalSettingsAction.fulfilled, (state, action)=>{
            console.log(action.payload, 'sss');   
            state.settings = {...state.settings, ...action.payload};
            state.success = true;
        })

        .addCase(getGlobalSettingsActions.fulfilled, (state, action)=>{
            state.settings = action.payload;
            state.success = true;
        })
        
    }
})

export const {setReset, setMinimumPrice, setIsEdited, setSelectedService, addService, updateService, deleteService, addQuestion, updateQuestion, updateQuestionOptionPrice, deleteQuestion, addPricing, updatePricing, deletePricing,
    addFeature, removeFeature, toggleFeature, adminLogout
} = adminSlice.actions;
export default  adminSlice.reducer;