package error;

@SuppressWarnings("serial")
public class CartNotFoundException extends RuntimeException {

	public CartNotFoundException(String message) {
		super(message);
	}
}
