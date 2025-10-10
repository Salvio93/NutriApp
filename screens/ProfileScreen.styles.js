import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {flex:1, padding: 20, marginTop:50,    backgroundColor: '#252222ff', },
  label: { fontSize: 18, marginBottom: 10, color: '#fff' },
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%',
  },
  input: {
    borderBottomWidth: 1, marginBottom: 10, padding: 5,
  },picker: {
    color: 'black',
    borderBlockColor: 'grey',
    width: '100%',
    marginBottom: 10,
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roundButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',

  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  
});